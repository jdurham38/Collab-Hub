import { useEffect, useRef, useCallback } from 'react';
import {
  RealtimeChannel,
  SupabaseClient,
  PostgrestError,
} from '@supabase/supabase-js';
import { Message, User } from '@/utils/interfaces';

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
  supabase: SupabaseClient;
}

interface PostgresChangesPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  supabase,
}: UseMessageSubscriptionParams) => {
  const userMapRef = useRef<{ [key: string]: User }>(userMap);
  const setMessagesRef =
    useRef<React.Dispatch<React.SetStateAction<Message[]>>>(setMessages);
  const setUserMapRef =
    useRef<React.Dispatch<React.SetStateAction<{ [key: string]: User }>>>(
      setUserMap,
    );
  const isUserAtBottomRef = useRef<() => boolean>(isUserAtBottom);
  const scrollToBottomRef =
    useRef<(behavior?: ScrollBehavior) => void>(scrollToBottom);
  const setNewMessagesCountRef =
    useRef<React.Dispatch<React.SetStateAction<number>>>(setNewMessagesCount);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    userMapRef.current = userMap;
    setMessagesRef.current = setMessages;
    setUserMapRef.current = setUserMap;
    isUserAtBottomRef.current = isUserAtBottom;
    scrollToBottomRef.current = scrollToBottom;
    setNewMessagesCountRef.current = setNewMessagesCount;
  }, [
    userMap,
    setMessages,
    setUserMap,
    isUserAtBottom,
    scrollToBottom,
    setNewMessagesCount,
  ]);

  const fetchUserIfNeeded = useCallback(
    async (userId: string): Promise<User> => {
      if (userMapRef.current[userId]) {
        return userMapRef.current[userId];
      }

      const {
        data,
        error,
      }: { data: User | null; error: PostgrestError | null } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user:', error);
        return { id: userId, username: 'Unknown User', email: '' };
      }

      setUserMapRef.current((prev) => ({ ...prev, [data.id]: data }));
      return data;
    },
    [supabase],
  );

  useEffect(() => {
    if (!initialLoadCompleted || !channelId) {
      return;
    }

    const channelName = `public:messages:channel_id=eq.${channelId}`;
    const newChannel: RealtimeChannel = supabase.channel(channelName);

    const handleInsert = async (payload: PostgresChangesPayload) => {
      const newMessage = payload.new as Message;

      const user = await fetchUserIfNeeded(newMessage.user_id);

      setMessagesRef.current((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          { ...newMessage, user: user },
        ];
        if (newMessage.user_id !== currentUserId) {
          setNewMessagesCountRef.current((prev) => prev + 1);
        }

        if (isUserAtBottomRef.current()) {
          setTimeout(() => {
            scrollToBottomRef.current('smooth');
          }, 50);
        }

        return updatedMessages;
      });
    };

    const handleUpdate = async (payload: PostgresChangesPayload) => {
      const updatedMessage = payload.new as Message;

      const user = await fetchUserIfNeeded(updatedMessage.user_id);

      setMessagesRef.current((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id
            ? {
                ...updatedMessage,
                user: user,
              }
            : msg,
        ),
      );
    };

    const handleDelete = (payload: PostgresChangesPayload) => {
      const deletedMessageId = payload.old?.id;

      if (deletedMessageId) {
        setMessagesRef.current((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== deletedMessageId),
        );
      }
    };

    newChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        handleInsert,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        handleUpdate,
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        handleDelete,
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = newChannel;
        } else {
          console.error(`Subscription error: ${status}`);
        }
      });

    return () => {
      if (channelRef.current) {
        if (
          channelRef.current &&
          typeof channelRef.current.unsubscribe === 'function'
        ) {
          channelRef.current.unsubscribe().then(() => {
            supabase.removeChannel(channelRef.current!);
            channelRef.current = null;
          });
        }
      }
    };
  }, [
    initialLoadCompleted,
    channelId,
    supabase,
    currentUserId,
    fetchUserIfNeeded,
  ]);

  return null;
};

export default useMessageSubscription;
