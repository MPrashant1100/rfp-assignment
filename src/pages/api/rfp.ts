import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import RFP from "@/models/RFP";
import { withRole, verifyToken } from "@/lib/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "POST") {
    // Buyer-only create
    const { title, description, file } = req.body as {
      title?: string;
      description?: string;
      file?: string;
    };
    if (!title || !description || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = (req as any).user;
    const rfp = await RFP.create({
      title,
      description,
      createdBy: user.userId,
      status: "Draft",
      versions: [{ filePath: file, version: 1, uploadedAt: new Date() }],
    });
    return res.status(201).json({ message: "RFP created", rfp });
  }

  if (req.method === "GET") {
    // MUST be authenticated
    const tokenData = verifyToken(req);
    if (!tokenData) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (tokenData.role === "Buyer") {
      // Buyer's own RFPs
      const rfps = await RFP.find({ createdBy: tokenData.userId })
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ rfps });
    } else if (tokenData.role === "Supplier") {
      // All published RFPs
      const rfps = await RFP.find({ status: "Published" })
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ rfps });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};

// Wrap only POST in withRole, leave GET free to handle both roles
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    return withRole(handler, ["Buyer"])(req, res);
  }
  return handler(req, res);
};
