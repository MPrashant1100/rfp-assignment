import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import RFP, { RFPStatus } from '@/models/RFP';
import { withRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

const validTransitions: Record<RFPStatus, RFPStatus[]> = {
  Draft:       ['Published'],
  Published:   ['Under Review'],
  'Under Review': ['Approved','Rejected'],
  Approved:    [],
  Rejected:    [],
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method Not Allowed' });
  await dbConnect();

  const { rfpId, status } = req.body as { rfpId: string; status: RFPStatus };
  if (!rfpId || !status) return res.status(400).json({ error: 'Missing fields' });

  const rfp = await RFP.findById(rfpId);
  if (!rfp) return res.status(404).json({ error: 'RFP not found' });
  if (!validTransitions[rfp.status as RFPStatus].includes(status)) {
    return res.status(400).json({ error: `Cannot move from ${rfp.status} to ${status}` });
  }

  rfp.status = status;
  await rfp.save();

  // simulate email
  await sendEmail({
    to: (rfp.createdBy as any).toString(),
    subject: `RFP "${rfp.title}" status: ${status}`,
    text: `Your RFP is now ${status}.`
  });

  return res.status(200).json({ message: 'Status updated', rfp });
}

export default withRole(handler, ['Buyer']);
