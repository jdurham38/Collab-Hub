import { useEffect, useRef } from 'react';
import { RealtimeChannel, PostgrestError } from '@supabase/supabase-js';
import { Message, User } from '@/utils/interfaces';
import getSupabaseClient from '@/lib/supabaseClient/supabase';

interface UseMessageSubscriptionParams {
  initialLoadCompleted: boolean;
  channelId: string;
  currentUserId: string;
  setUserMap: React.Dispatch<React.SetStateAction<{ [key: string]: User }>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  isUserAtBottom: () => boolean;
  setNewMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  userMap: { [key: string]: User };
}

interface PostgresChangesPayload {
  [key: string]: any;
}

const useMessageSubscription = ({
  initialLoadCompleted,
  channelId,
  currentUserId,
  userMap,
  setUserMap,
  setMessages,
  scrollToBottom,
  isUserAtBottom,
  setNewMessagesCount,
}: UseMessageSubscriptionParams) => {
  const userMapRef = useRef<{ [key: string]: User }>(userMap);
  const supabase = getSupabaseClient();

  useEffect(() => {
    userMapRef.current = userMap;
  }, [userMap]);

  useEffect(() => {
    if (!initialLoadCompleted) return;

    const channel: RealtimeChannel = supabase.channel(
      `public:messages:channel_id=eq.${channelId}`
    );

    const handleInsertRef: (payload: PostgresChangesPayload) => void = async (
      payload: PostgresChangesPayload
    ) => {
      const newMessage = payload.new as Message;
      const user = await fetchUserIfNeeded(newMessage.user_id);

      setMessages((prevMessages) => {
        const updated = [...prevMessages, { ...newMessage, users: user }].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const isAtBottomNow = isUserAtBottom();

        if (!isAtBottomNow && newMessage.user_id !== currentUserId) {
          setNewMessagesCount((prev) => prev + 1);
        } else if (isAtBottomNow) {
          scrollToBottom();
        }

        return updated;
      });
    };

    const handleUpdateRef: (payload: PostgresChangesPayload) => void = async (
      payload: PostgresChangesPayload
    ) => {
      const updatedMessage = payload.new as Message;
      const user = userMapRef.current[updatedMessage.user_id] || {
        username: 'Unknown User',
        email: '',
      };

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? { ...updatedMessage, users: user } : msg
        )
      );
    };

    const handleDeleteRef: (payload: PostgresChangesPayload) => void = (
      payload: PostgresChangesPayload
    ) => {
      const deletedMessageId = payload.old?.id;
      if (deletedMessageId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== deletedMessageId)
        );
      }
    };

    const fetchUserIfNeeded = async (userId: string): Promise<User> => {
      if (userMapRef.current[userId]) {
        return userMapRef.current[userId];
      }
      const { data, error }: { data: User | null; error: PostgrestError | null } =
        await supabase
          .from('users')
          .select('id, username, email')
          .eq('id', userId)
          .single();

      if (error || !data) {
        return { id: userId, username: 'Unknown User', email: '' };
      }

      setUserMap((prev) => ({ ...prev, [data.id]: data }));
      return data;
    };

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        handleInsertRef
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        handleUpdateRef
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        handleDeleteRef
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error(`Subscription error: ${status}`);
        }
      });

    return () => {
      channel
        .unsubscribe()
        .then(() => {
          console.log('Unsubscribed from channel');
          supabase.removeChannel(channel);
        })
        .catch((error: any) => {
          console.error('Error unsubscribing from channel:', error);
        });
    };
  }, [
    initialLoadCompleted,
    channelId,
    currentUserId,
  ]);

  return null;
};

export default useMessageSubscription;