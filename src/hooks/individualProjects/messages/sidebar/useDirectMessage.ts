import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DirectMessage } from '@/utils/interfaces';

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const useDirectMessages = (currentUserId: string, recipient_id: string) => {
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`sender_id.eq.${currentUserId},recipient_id.eq.${recipient_id}`); // Correct column name: receiver_id

        if (supabaseError) {
          console.error('supabase error fetching direct messages:');
          setError(supabaseError.message);
        } else {
          setDirectMessages(data || []); 
          console.log("Direct messages fetched and set:", data);
        } 
      } catch (err) {
        if(err instanceof Error){
          const errormessage = err.message;
          setError(errormessage);
          console.error('Error fetching direct messages:', error);
        } else{
          const errorMessage = 'an unexpected error occurred';
          setError(errorMessage);
          console.error('error fetching direct messages', err)
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectMessages();
  }, [currentUserId, recipient_id]);
  console.log('directMessages state in useDirectMessages:', directMessages)
  return { directMessages, isLoading, error, setDirectMessages };
  
};

export default useDirectMessages;