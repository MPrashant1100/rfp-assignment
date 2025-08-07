import type { NextApiRequest, NextApiResponse } from "next";
import upload from "@/lib/multer";
import dbConnect from "@/lib/mongodb";
import RFP from "@/models/RFP";
import { withRole } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

const buyerOnly = withRole(
  async (req: any, res: NextApiResponse) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    await dbConnect();

    // Process the multipart file upload
    await new Promise<void>((resolve, reject) =>
      upload.single("file")(req, res as any, (err: any) =>
        err ? reject(err) : resolve()
      )
    );

    if (!req.file) {
      return res.status(400).json({ error: "Missing file" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const { rfpId } = req.body as { rfpId?: string };

    // If an rfpId was provided, treat this as a new version
    if (rfpId) {
      const rfp = await RFP.findById(rfpId);
      if (!rfp) {
        return res.status(404).json({ error: "RFP not found" });
      }
      const lastVersion = rfp.versions.length
        ? rfp.versions[rfp.versions.length - 1].version
        : 0;
      rfp.versions.push({
        filePath,
        version: lastVersion + 1,
        uploadedAt: new Date(),
      });
      await rfp.save();
    }

    // Always return the path so front-end can continue
    return res.status(200).json({ message: "File uploaded", filePath });
  },
  ["Buyer"]
);

export default buyerOnly;
