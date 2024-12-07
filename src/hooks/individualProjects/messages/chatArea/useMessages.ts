import { useState, useEffect, useRef } from 'react';
import { fetchMessages } from '@/services/messageService';
import { Message, User } from '@/utils/interfaces';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  initialLoadCompleted: boolean;
}

const useMessages = (
  projectId: string,
  channelId: string,
  userMap: { [key: string]: User },
  setUserMap: React.Dispatch<React.SetStateAction<{ [key: string]: User }>>
): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadCompleted, setInitialLoadCompleted] = useState<boolean>(false);
  
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const fetchMessagesData = async () => {
      setIsLoading(true);
      setError(null);
      isInitialLoadRef.current = true;

      try {
        const messagesData = await fetchMessages(projectId, channelId);
        const uniqueUserIds = Array.from(new Set(messagesData.map((msg) => msg.user_id)));
        const missingUserIds = uniqueUserIds.filter((uid) => !userMap[uid]);

        if (missingUserIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, email')
            .in('id', missingUserIds);

          if (usersError) {
            console.error('Error fetching missing users:', usersError.message);
          } else if (usersData) {
            const newUserMapEntries = (usersData as User[]).reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as { [key: string]: User });

            setUserMap((prev) => ({ ...prev, ...newUserMapEntries }));
          }
        }

        const messagesWithUser = messagesData.map((message) => {
          const user = userMap[message.user_id] || { username: 'Unknown User', email: '' };
          return { ...message, users: user };
        });

        setMessages(messagesWithUser);
        setIsLoading(false);
        setInitialLoadCompleted(true);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages.');
        setIsLoading(false);
      }
    };

    // Always attempt to fetch messages, regardless of userMap state.
    fetchMessagesData();
  }, [projectId, channelId, userMap, setUserMap]);

  return { messages, isLoading, error, setMessages, initialLoadCompleted };
};

export default useMessages;
