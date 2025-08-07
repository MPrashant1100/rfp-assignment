import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Response, { ResponseStatus } from '@/models/Response';
import { withRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

const validTransitions: Record<ResponseStatus, ResponseStatus[]> = {
  Submitted: ['Under Review', 'Approved', 'Rejected'],
  'Under Review': ['Approved', 'Rejected'],
  Approved: [],
  Rejected: [],
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method Not Allowed' });

  const { responseId, status } = req.body as { responseId?: string; status?: ResponseStatus };
  if (!responseId || !status) return res.status(400).json({ error: 'Missing required fields' });

  const resp = await Response.findById(responseId);
  if (!resp) return res.status(404).json({ error: 'Response not found' });

  if (!validTransitions[resp.status].includes(status)) {
    return res
      .status(400)
      .json({ error: `Invalid status transition from ${resp.status} to ${status}` });
  }

  resp.status = status;
  await resp.save();

  // Simulated email
  await sendEmail({
    to: resp.supplier.toString(),
    subject: `Response Status Updated`,
    text: `Your response is now: ${status}`,
  });

  return res.status(200).json({ message: 'Response status updated', response: resp });
};

export default withRole(handler, ['Buyer']);
