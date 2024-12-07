import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Message, User } from '@/utils/interfaces';

interface UseMessageSubscriptionParams {
  supabase: any;
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

const useMessageSubscription = ({
  supabase,
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
  useEffect(() => {
    if (!initialLoadCompleted) return;

    const channel: RealtimeChannel = supabase.channel(`public:messages:channel_id=eq.${channelId}`);

    const fetchUserIfNeeded = async (userId: string): Promise<User> => {
      if (userMap[userId]) {
        return userMap[userId];
      }
      const { data, error } = await supabase
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

    const handleInsert = async (payload: any) => {
        const newMessage = payload.new as Message;
        const user = await fetchUserIfNeeded(newMessage.user_id);
      
        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg.id === newMessage.id)) {
            return prevMessages;
          }
      
          const updated = [...prevMessages, { ...newMessage, users: user }].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
      
          const isAtBottomNow = isUserAtBottom();
      
          // If the message is not from the current user and user is not at bottom, show indicator
          // If the message is from the current user, do NOT show indicator regardless of position.
          if (!isAtBottomNow && newMessage.user_id !== currentUserId) {
            setNewMessagesCount((prev) => prev + 1);
          } else if (isAtBottomNow) {
            // If user is at bottom, always scroll
            scrollToBottom();
          }
      
          return updated;
        });
      };
      

    const handleUpdate = async (payload: any) => {
      const updatedMessage = payload.new as Message;
      const user = userMap[updatedMessage.user_id] || { username: 'Unknown User', email: '' };

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? { ...updatedMessage, users: user } : msg
        )
      );
    };

    const handleDelete = (payload: any) => {
      const deletedMessageId = payload.old?.id;
      if (deletedMessageId) {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== deletedMessageId));
      }
    };

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        handleInsert
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        handleUpdate
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        handleDelete
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error(`Subscription error: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    supabase,
    initialLoadCompleted,
    channelId,
    currentUserId,
    userMap,
    setUserMap,
    setMessages,
    scrollToBottom,
    isUserAtBottom,
    setNewMessagesCount,
  ]);
};

export default useMessageSubscription;
