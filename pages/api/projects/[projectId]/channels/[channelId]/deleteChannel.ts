// File: /pages/api/projects/[projectId]/[channelId]/deleteChannel.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with server-side credentials (Service Role Key)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '' // Use Service Role Key for server-side operations
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, channelId } = req.query;

  // Validate projectId and channelId
  if (typeof projectId !== 'string' || typeof channelId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID or channel ID' });
  }

  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Optional: Implement Authentication & Authorization Here
  // Example:
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  // const { user, error: authError } = await supabase.auth.getUser(token);
  // if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  // // Further authorization checks...

  try {
    // **Step 1: Delete All Messages in the Channel**
    const { data: deletedMessages, error: deleteMessagesError } = await supabase
      .from('messages')
      .delete()
      .eq('channel_id', channelId)
      .select(); // Chain .select() to retrieve deleted rows

    if (deleteMessagesError) {
      console.error('Error deleting messages:', deleteMessagesError.message);
      return res.status(500).json({ error: 'Error deleting messages' });
    }

    // Handle cases where there are no messages
    const deletedCount = deletedMessages ? deletedMessages.length : 0;
    console.log(`Deleted ${deletedCount} messages from channel ${channelId}`);

    // **Step 2: Delete the Channel**
    const { data: deletedChannel, error: deleteChannelError } = await supabase
      .from('channels')
      .delete()
      .eq('project_id', projectId)
      .eq('id', channelId)
      .select() // Chain .select() to retrieve the deleted channel
      .single(); // Expecting to delete a single channel

    if (deleteChannelError) {
      console.error('Error deleting channel:', deleteChannelError.message);
      return res.status(500).json({ error: 'Error deleting channel' });
    }

    if (!deletedChannel) {
      console.error('Channel not found or already deleted');
      return res.status(404).json({ error: 'Channel not found' });
    }

    console.log(`Channel ${channelId} deleted successfully from project ${projectId}`);

    // **Step 3: Return Success Response**
    return res.status(200).json({
      message: `Channel ${channelId} and all associated messages have been deleted successfully.`,
      deletedMessagesCount: deletedCount,
    });
  } catch (error) {
    console.error('Unexpected error deleting channel and messages:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
