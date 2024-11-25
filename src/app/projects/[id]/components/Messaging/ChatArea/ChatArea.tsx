import React, { useEffect, useState } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import styles from './ChatArea.module.css';

interface User {
  id: string;
  email: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  channel_id: string;
  users: {
    email: string;
  };
}

interface ChatAreaProps {
  chatTitle: string;
  projectId: string;
  currentUser: User;
  channelId: string; // Accept channelId as a prop
}

const ChatArea: React.FC<ChatAreaProps> = ({
  chatTitle,
  projectId,
  currentUser,
  channelId,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*, users(email)')
          .eq('channel_id', channelId)
          .order('timestamp', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError.message);
          if (isMounted) setMessages([]);
        } else {
          if (isMounted) setMessages(messagesData ?? []);
        }
      } catch (err) {
        console.error('Unexpected error fetching messages:', err);
        if (isMounted) setMessages([]);
      }
    };

    fetchMessages();

    // Set up real-time subscriptions
    const channel: RealtimeChannel = supabase.channel(
      `public:messages:channel_id=eq.${channelId}`
    );

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          // Fetch user email
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', newMessage.user_id)
            .single();

          if (userError) {
            console.error('Error fetching user:', userError.message);
            return;
          }

          newMessage.users = { email: userData.email };

          if (isMounted) {
            setMessages((prevMessages) =>
              [...prevMessages, newMessage].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const updatedMessage = payload.new as Message;

          // Fetch user email
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', updatedMessage.user_id)
            .single();

          if (userError) {
            console.error('Error fetching user:', userError.message);
            return;
          }

          updatedMessage.users = { email: userData.email };

          if (isMounted) {
            setMessages((prevMessages) =>
              prevMessages
                .map((message) =>
                  message.id === updatedMessage.id ? updatedMessage : message
                )
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const deletedMessageId = payload.old.id;

          if (isMounted) {
            setMessages((prevMessages) =>
              prevMessages.filter((message) => message.id !== deletedMessageId)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time updates for channel:', channelId);
        } else {
          console.error('Subscription failed:', status);
        }
      });

    // Cleanup subscription on unmount or channelId change
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const { error: insertError } = await supabase.from('messages').insert([
        {
          content: newMessage.trim(),
          project_id: projectId,
          user_id: currentUser.id,
          channel_id: channelId,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error('Error sending message:', insertError.message);
      } else {
        setNewMessage(''); // Clear the input field
        // No need to manually update messages; the real-time listener will handle it
      }
    } catch (error) {
      console.error('Unexpected error sending message:', error);
    }
  };

  return (
    <div className={styles.chatArea}>
      <div className={styles.chatHeader}>
        <h3>{chatTitle}</h3>
      </div>
      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.user_id === currentUser.id
                ? styles.yourMessage
                : styles.otherMessage
            }`}
          >
            <div className={styles.messageInfo}>
              <span className={styles.userName}>
                {message.users?.email || 'Loading...'}
              </span>
              <span className={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className={styles.messageText}>{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
