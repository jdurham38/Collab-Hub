import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function declineProjectRequest(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { requestId } = req.body;

  if (!requestId) {
    return res
      .status(400)
      .json({ error: 'Missing requestId in the request body' });
  }

  try {
    // Update the ProjectRequest to Declined and set isReadSender to false
    const { error: updateRequestError } = await supabase
      .from('ProjectRequest')
      .update({ status: 'Declined', isReadSender: false }) // Added isReadSender: false
      .eq('id', requestId);

    if (updateRequestError) {
      console.error('Error updating project request:', updateRequestError);
      return res
        .status(500)
        .json({
          error: 'Failed to update project request status',
          details: updateRequestError.message,
        });
    }

    return res
      .status(200)
      .json({ message: 'Project request declined successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        error: 'An unexpected error occurred',
        details: error.message,
      });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        error: 'An unexpected error occurred',
      });
    }
  }
}