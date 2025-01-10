import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DirectMessage, User } from '@/utils/interfaces';

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

interface UseDirectMessagesReturn {
  directMessages: DirectMessage[];
  isLoading: boolean;
  error: string | null;
  setDirectMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
}

const useDirectMessages = (
  currentUserId: string,
  recipient_id: string,
  userMap: { [key: string]: User } | null,
  setUserMap: React.Dispatch<React.SetStateAction<{ [key: string]: User }>>,
): UseDirectMessagesReturn => {
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userMap) {
      return;
    }
    const fetchDirectMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(
            `and(sender_id.eq.${currentUserId},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${currentUserId})`,
          );

        if (supabaseError) {
          console.error(
            'supabase error fetching direct messages:',
            supabaseError,
          );
          setError(supabaseError.message);
        } else if (data) {
          const uniqueUserIds = Array.from(
            new Set(data.map((msg) => msg.sender_id)),
          );
          const missingUserIds = uniqueUserIds.filter((uid) => !userMap[uid]);

          if (missingUserIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, username, email')
              .in('id', missingUserIds);

            if (usersError) {
              console.error(
                'Error fetching missing users:',
                usersError.message,
              );
            } else if (usersData) {
              const newUserMapEntries = (usersData as User[]).reduce(
                (acc, user) => {
                  acc[user.id] = user;
                  return acc;
                },
                {} as { [key: string]: User },
              );

              setUserMap((prev) => ({ ...prev, ...newUserMapEntries }));
            }
          }

          const messagesWithUser = data.map((message) => {
            const user = userMap[message.sender_id] || {
              username: 'Unknown User',
              email: '',
            };
            return { ...message, user: user };
          });
          setDirectMessages(messagesWithUser || []);
        }
      } catch (err) {
        if (err instanceof Error) {
          const errormessage = err.message;
          setError(errormessage);
          console.error('Error fetching direct messages:', err);
        } else {
          const errorMessage = 'an unexpected error occurred';
          setError(errorMessage);
          console.error('error fetching direct messages', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectMessages();
  }, [currentUserId, recipient_id, setUserMap, userMap]);
  return { directMessages, isLoading, error, setDirectMessages };
};

export default useDirectMessages;
