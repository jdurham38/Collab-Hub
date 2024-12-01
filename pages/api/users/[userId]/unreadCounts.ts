// pages/api/users/[userId]/unreadCounts.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'GET') {
    try {
      const { data: unreadData, error } = await supabase.rpc('get_unread_counts', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching unread counts:', error.message);
        return res.status(500).json({ error: 'Error fetching unread counts' });
      }

      return res.status(200).json({ unreadCounts: unreadData });
    } catch (err) {
      console.error('Unexpected error fetching unread counts:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
