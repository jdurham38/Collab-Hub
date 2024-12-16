import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeChannel, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { DirectMessage, User } from '@/utils/interfaces';

interface UseDirectMessageSubscriptionParams {
  initialLoadCompleted: boolean;
  currentUserId: string;
  recipient_id: string;
  setUserMap: React.Dispatch<React.SetStateAction<{ [key: string]: User }>>;
  setMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  isUserAtBottom: () => boolean;
  setNewMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  userMap: { [key: string]: User };
  supabase: SupabaseClient;
}

interface PostgresChangesPayload {
  [key: string]: any;
}

const useDirectMessageSubscription = ({
  initialLoadCompleted,
  currentUserId,
  recipient_id,
  userMap,
  setUserMap,
  setMessages,
  scrollToBottom,
  isUserAtBottom,
  setNewMessagesCount,
  supabase,
}: UseDirectMessageSubscriptionParams) => {
  const userMapRef = useRef<{ [key: string]: User }>(userMap);
  const setMessagesRef = useRef<React.Dispatch<React.SetStateAction<DirectMessage[]>>>(setMessages);
  const setUserMapRef = useRef<React.Dispatch<React.SetStateAction<{ [key: string]: User }>>>(setUserMap);
  const isUserAtBottomRef = useRef<() => boolean>(isUserAtBottom);
  const scrollToBottomRef = useRef<(behavior?: ScrollBehavior) => void>(scrollToBottom);
  const setNewMessagesCountRef = useRef<React.Dispatch<React.SetStateAction<number>>>(setNewMessagesCount);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Update refs whenever the corresponding values change
  useEffect(() => {
    userMapRef.current = userMap;
    setMessagesRef.current = setMessages;
    setUserMapRef.current = setUserMap;
    isUserAtBottomRef.current = isUserAtBottom;
    scrollToBottomRef.current = scrollToBottom;
    setNewMessagesCountRef.current = setNewMessagesCount;
  }, [userMap, setMessages, setUserMap, isUserAtBottom, scrollToBottom, setNewMessagesCount]);

  // useCallback for fetchUserIfNeeded
  const fetchUserIfNeeded = useCallback(
    async (userId: string): Promise<User> => {
      if (userMapRef.current[userId]) {
        console.log('User found in userMap:', userMapRef.current[userId]);
        return userMapRef.current[userId];
      }

      const { data, error }: { data: User | null; error: PostgrestError | null } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user:', error);
        return { id: userId, username: 'Unknown User', email: '' };
      }

      console.log('User fetched from Supabase:', data);
      setUserMapRef.current((prev) => ({ ...prev, [data.id]: data }));
      return data;
    },
    [supabase]
  );

  useEffect(() => {
    console.log('Type of currentUserId in useEffect:', typeof currentUserId);
    console.log('Value of currentUserId in useEffect:', currentUserId);
    console.log('Type of recipient_id in useEffect:', typeof recipient_id);
    console.log('Value of recipient_id in useEffect:', recipient_id);

    if (!initialLoadCompleted || !currentUserId || !recipient_id) {
      return;
    }

    const channelName = `direct_messages:or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${currentUserId}))`;

    const newChannel: RealtimeChannel = supabase.channel(channelName);
    
     // Define event handlers INSIDE the useEffect
     const handleInsert = async (payload: PostgresChangesPayload) => {
       console.log('handleInsert triggered:', payload);
       const newMessage = payload.new as DirectMessage;
     
       if (
         (newMessage.sender_id === currentUserId && newMessage.recipient_id === recipient_id) ||
         (newMessage.sender_id === recipient_id && newMessage.recipient_id === currentUserId)
       ) {
         const user = await fetchUserIfNeeded(newMessage.sender_id);
         console.log('User fetched in handleInsert:', user);
     
         setMessagesRef.current((prevMessages) => {
           const updatedMessages = [...prevMessages, { ...newMessage, user: user }];
           console.log('Updated messages in handleInsert:', updatedMessages);
    
           console.log("Calling setMessagesRef.current with:", updatedMessages);    
           // Log before returning to verify the new array
           console.log("About to return updated messages from handleInsert:", updatedMessages);
     
           if (isUserAtBottomRef.current()) {
             setTimeout(() => {
               scrollToBottomRef.current('smooth');
             }, 50);
           }
     
           return updatedMessages;
         });
       }
     };
    
     const handleUpdate = async (payload: PostgresChangesPayload) => {
       console.log('handleUpdate triggered:', payload);
       const updatedMessage = payload.new as DirectMessage;
    
       setMessagesRef.current((prevMessages) =>
         prevMessages.map((msg) =>
           msg.id === updatedMessage.id
             ? {
                 ...updatedMessage,
                 user: userMapRef.current[updatedMessage.sender_id] || { username: 'Unknown User', email: '' },
               }
             : msg
         )
       );
     };
    
     const handleDelete = (payload: PostgresChangesPayload) => {
       console.log('handleDelete triggered:', payload);
       const deletedMessageId = payload.old?.id;
    
       if (deletedMessageId) {
         setMessagesRef.current((prevMessages) => prevMessages.filter((msg) => msg.id !== deletedMessageId));
       }
     };
     // Subscribe with the correctly filtered event handlers
     newChannel
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'direct_messages',
                 },
         handleInsert
       )
       .on(
         'postgres_changes',
         {
           event: 'UPDATE',
           schema: 'public',
           table: 'direct_messages',
           
         },
         handleUpdate
       )
       .on(
         'postgres_changes',
         {
           event: 'DELETE',
           schema: 'public',
           table: 'direct_messages',
         },
         handleDelete
       )
       .subscribe((status) => {
         if (status === 'SUBSCRIBED') {
           console.log('Subscription successful');
           setChannel(newChannel);
         } else {
           console.error(`Subscription error: ${status}`);
         }
       });


    // Cleanup function
    return () => {
      if (channel) {
        channel.unsubscribe().then(() => {
          console.log('Unsubscribed from direct message channel');
          supabase.removeChannel(channel);
          setChannel(null);
        });
      }
    };
  }, [initialLoadCompleted, currentUserId, recipient_id, supabase, fetchUserIfNeeded]);

  return null;
};

export default useDirectMessageSubscription;