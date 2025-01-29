// pages/api/notifications/mark-all-invites-read.ts
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
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { recordIds, userId } = req.body;

    if (!recordIds || !userId ) {
      return res
         .status(400)
         .json({ error: 'Missing recordIds or userId in the request body' });
   }
  try {
    const { error } = await supabase
      .from('project_invites')
      .update({ isInviteReceivedRead: true })
      .in('id', recordIds);
        if(error) {
           console.error('Error marking project invites as read:', error);
            return res
              .status(500)
              .json({
                error: 'Failed to mark project invites as read',
                  details: error.message,
              });
        }
    return res.status(200).json({ message: 'Project invites marked as read' });
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