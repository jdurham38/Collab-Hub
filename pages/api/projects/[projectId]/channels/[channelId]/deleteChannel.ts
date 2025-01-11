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
  const { projectId, channelId } = req.query;

  if (typeof projectId !== 'string' || typeof channelId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID or channel ID' });
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  try {
    const { data: channelData, error: fetchChannelError } = await supabase
      .from('channels')
      .select('name')
      .eq('id', channelId)
      .eq('project_id', projectId)
      .single();

    if (fetchChannelError) {
      console.error('Error fetching channel:', fetchChannelError.message);
      return res
        .status(500)
        .json({ error: 'Error fetching channel information' });
    }

    if (!channelData) {
      console.error('Channel not found');
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelName = channelData.name;

    const { data: deletedMessages, error: deleteMessagesError } = await supabase
      .from('messages')
      .delete()
      .eq('channel_id', channelId)
      .select();

    if (deleteMessagesError) {
      console.error('Error deleting messages:', deleteMessagesError.message);
      return res.status(500).json({ error: 'Error deleting messages' });
    }

    const deletedCount = deletedMessages ? deletedMessages.length : 0;

    const { data: deletedChannel, error: deleteChannelError } = await supabase
      .from('channels')
      .delete()
      .eq('project_id', projectId)
      .eq('id', channelId)
      .select()
      .single();

    if (deleteChannelError) {
      console.error('Error deleting channel:', deleteChannelError.message);
      return res.status(500).json({ error: 'Error deleting channel' });
    }

    if (!deletedChannel) {
      console.error('Channel not found or already deleted');
      return res.status(404).json({ error: 'Channel not found' });
    }

    return res.status(200).json({
      message: `Channel "${channelName}" and all associated messages have been deleted successfully.`,
      deletedMessagesCount: deletedCount,
    });
  } catch (error) {
    console.error('Unexpected error deleting channel and messages:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
