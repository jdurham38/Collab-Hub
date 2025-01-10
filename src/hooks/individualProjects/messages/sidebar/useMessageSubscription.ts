import { useEffect } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';

interface ActiveChat {
  id: string;
  name: string;
}

const useMessageSubscription = (
  currentUserId: string,
  incrementUnreadCount: (channelId: string) => void,
  activeChat: ActiveChat | null,
) => {
  useEffect(() => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new;
          if (
            newMessage.user_id !== currentUserId &&
            activeChat?.id !== newMessage.channel_id
          ) {
            incrementUnreadCount(newMessage.channel_id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, incrementUnreadCount, activeChat]);
};

export default useMessageSubscription;
