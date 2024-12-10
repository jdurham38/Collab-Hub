import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Function to send a direct message
export const sendDirectMessage = async (
  projectId: string,
  recipient_id: string,
  content: string,
  senderId: string
) => {
  const { error } = await supabase.from('direct_messages').insert([
    {
      project_id: projectId,
      recipient_id: recipient_id,
      content: content,
      sender_id: senderId,
    },
  ]);

  if (error) {
    console.error('Error sending direct message:', error);
    throw error;
  }
};

// Function to edit a direct message
export const editDirectMessage = async (messageId: string, content: string) => {
  const { error } = await supabase
    .from('direct_messages')
    .update({ content: content, edited: true })
    .eq('id', messageId);

  if (error) {
    console.error('Error editing direct message:', error);
    throw error;
  }
};

// Function to delete a direct message
export const deleteDirectMessage = async (messageId: string) => {
  const { error } = await supabase.from('direct_messages').delete().eq('id', messageId);

  if (error) {
    console.error('Error deleting direct message:', error);
    throw error;
  }
};