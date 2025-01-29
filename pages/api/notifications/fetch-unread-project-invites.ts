// pages/api/notifications/fetch-unread-project-invites.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res
      .status(400)
      .json({ error: 'Missing or invalid userId in the request' });
  }

  try {
    const { data, error } = await supabase
      .from('project_invites')
      .select('*')
      .eq('receiver_id', userId)
      .eq('isInviteReceivedRead', false);

    if (error) {
      console.error('Error fetching unread project invites:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
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