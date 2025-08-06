import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import RFP, { RFPStatus } from '../../models/RFP';
import { withRole } from '../../lib/auth';
import { sendEmail } from '../../lib/email';

const validTransitions: Record<RFPStatus, RFPStatus[]> = {
  'Draft': ['Published'],
  'Published': ['Under Review'],
  'Under Review': ['Approved', 'Rejected'],
  'Approved': [],
  'Rejected': [],
};

export default withRole(async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { rfpId, status } = req.body;
  if (!rfpId || !status) {
    return res.status(400).json({ message: 'Missing rfpId or status' });
  }
  const rfp = await RFP.findById(rfpId);
  if (!rfp) {
    return res.status(404).json({ message: 'RFP not found' });
  }
  if (!validTransitions[rfp.status as RFPStatus].includes(status)) {
    return res.status(400).json({ message: `Invalid status transition from ${rfp.status} to ${status}` });
  }
  rfp.status = status;
  await rfp.save();
  // Notify creator (simulate email)
  await sendEmail({
    to: rfp.createdBy.toString(),
    subject: `RFP Status Updated: ${rfp.title}`,
    text: `The status of your RFP has changed to: ${status}`
  });
  res.status(200).json({ message: 'RFP status updated', rfp });
}, ['Buyer']);