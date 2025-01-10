'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@/utils/interfaces';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

const useReceiverInfo = (recipientId: string) => {
  const [receiver, setReceiver] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceiverInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', recipientId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setReceiver(data as User);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('an unknown error has occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (recipientId) {
      fetchReceiverInfo();
    }
  }, [recipientId]);
  return { receiver, loading, error };
};

export default useReceiverInfo;
