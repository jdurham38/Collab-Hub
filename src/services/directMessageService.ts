import getSupabaseClient from '@/lib/supabaseClient/supabase';

const supabase = getSupabaseClient();
export const sendDirectMessage = async (
  projectId: string,
  recipient_id: string,
  content: string,
  senderId: string,
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

export const deleteDirectMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('direct_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting direct message:', error);
    throw error;
  }
};
