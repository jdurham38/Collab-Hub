// File: pages/api/projects/[projectId]/channels/[channelId]/messages.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '' // Use service role key for server-side operations
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, channelId } = req.query;

  if (typeof projectId !== 'string' || typeof channelId !== 'string') {
    return res.status(400).json({ error: 'Invalid project or channel ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*, users(username, email)')
          .eq('channel_id', channelId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error.message);
          return res.status(500).json({ error: 'Error fetching messages' });
        }

        return res.status(200).json({ messages });
      } catch (err) {
        console.error('Unexpected error fetching messages:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    case 'POST':
      const { content, user_id } = req.body;

      if (!content || !user_id) {
        return res.status(400).json({ error: 'Content and user_id are required' });
      }

      try {
        const { error } = await supabase.from('messages').insert([
          {
            content: content.trim(),
            project_id: projectId,
            user_id,
            channel_id: channelId,
            timestamp: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error('Error sending message:', error.message);
          return res.status(500).json({ error: 'Error sending message' });
        }

        return res.status(201).json({ message: 'Message sent successfully' });
      } catch (err) {
        console.error('Unexpected error sending message:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
