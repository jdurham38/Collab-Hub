import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DirectMessage } from '@/utils/interfaces';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const useDirectMessages = (currentUserId: string) => {
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`); // Correct column name: receiver_id

        if (error) {
          console.error('Error fetching direct messages:', error);
          setError(error.message);
        } else {
          setDirectMessages(data || []); // If data is null, set to an empty array
        }
      } catch (error: any) {
        console.error('Error fetching direct messages:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectMessages();
  }, [currentUserId]);

  return { directMessages, isLoading, error, setDirectMessages };
};

export default useDirectMessages;