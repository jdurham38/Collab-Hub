import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function markApplicationsSentAsRead(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

    const { requestIds, userId } = req.body;

    if (!requestIds || !userId ) {
      return res.status(400).json({ error: 'Missing requestIds or userId' });
    }

  try {

      const { error } = await supabase
          .from('ProjectRequest')
          .update({ isReadSender: true })
          .in('id', requestIds)
          .eq('userId', userId);

      if (error) {
            console.error('Error marking notifications as read:', error);
            return res.status(500).json({
                error: 'Failed to mark notifications as read',
                details: error.message,
            });
        }

    return res.status(200).json({ message: 'Notifications marked as read' });
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