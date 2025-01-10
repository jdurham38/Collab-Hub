import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { channelId } = req.query;
  const { userId } = req.body;

  if (typeof channelId !== 'string' || !userId) {
    return res.status(400).json({ error: 'Invalid channel ID or user ID' });
  }

  if (req.method === 'POST') {
    try {
      const { error } = await supabase.from('channel_read_status').upsert(
        {
          user_id: userId,
          channel_id: channelId,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,channel_id' },
      );

      if (error) {
        console.error('Error updating read status:', error.message);
        return res.status(500).json({ error: 'Error updating read status' });
      }

      return res.status(200).json({ message: 'Read status updated' });
    } catch (err) {
      console.error('Error updating read status:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
