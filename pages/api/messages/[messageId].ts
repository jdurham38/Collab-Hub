

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messageId } = req.query;

  if (typeof messageId !== 'string') {
    return res.status(400).json({ error: 'Invalid message ID' });
  }

  switch (req.method) {
    case 'PUT':

      try {
        const { content } = req.body;

        if (!content) {
          return res.status(400).json({ error: 'Content is required' });
        }
  
        const { error } = await supabase
          .from('messages')
          .update({ content: content.trim(), edited: true })
          .eq('id', messageId);

        if (error) {
          console.error('Error editing message:', error.message);
          return res.status(500).json({ error: 'Error editing message' });
        }

        return res.status(200).json({ message: 'Message edited successfully' });
      } catch (err) {
        console.error('Unexpected error editing message:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    case 'DELETE':
      try {
        const { error } = await supabase.from('messages').delete().eq('id', messageId);

        if (error) {
          console.error('Error deleting message:', error.message);
          return res.status(500).json({ error: 'Error deleting message' });
        }

        return res.status(200).json({ message: 'Message deleted successfully' });
      } catch (err) {
        console.error('Unexpected error deleting message:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
