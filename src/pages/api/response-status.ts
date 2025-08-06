import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Response, { ResponseStatus } from '../../models/Response';
import { withRole } from '../../lib/auth';
import { sendEmail } from '../../lib/email';

const validTransitions: Record<ResponseStatus, ResponseStatus[]> = {
  'Submitted': ['Under Review'],
  'Under Review': ['Approved', 'Rejected'],
  'Approved': [],
  'Rejected': [],
};

export default withRole(async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { responseId, status } = req.body;
  if (!responseId || !status) {
    return res.status(400).json({ message: 'Missing responseId or status' });
  }
  const response = await Response.findById(responseId);
  if (!response) {
    return res.status(404).json({ message: 'Response not found' });
  }
  if (!validTransitions[response.status].includes(status)) {
    return res.status(400).json({ message: `Invalid status transition from ${response.status} to ${status}` });
  }
  response.status = status;
  await response.save();
  // Notify supplier (simulate email)
  await sendEmail({
    to: response.supplier.toString(),
    subject: `Response Status Updated`,
    text: `The status of your response has changed to: ${status}`
  });
  res.status(200).json({ message: 'Response status updated', response });
}, ['Buyer']);