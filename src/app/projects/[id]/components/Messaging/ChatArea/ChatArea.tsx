'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  edited?: boolean; // Track if a message was edited
  users: {
    email: string;
  };
}

interface ChatAreaProps {
  chatTitle: string;
  projectId: string;
  currentUser: User;
  channelId: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  chatTitle,
  projectId,
  currentUser,
  channelId,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null); // Track which message menu is open
  const supabase = getSupabaseClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*, users(email)')
          .eq('channel_id', channelId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error.message);
          setMessages([]);
        } else {
          setMessages(messagesData ?? []);
        }
      } catch (err) {
        console.error('Unexpected error fetching messages:', err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [channelId]);

  // Set up RealtimeChannel for real-time updates
  useEffect(() => {
    const channel: RealtimeChannel = supabase.channel(
      `public:messages:channel_id=eq.${channelId}`
    );

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) =>
            [...prevMessages, newMessage].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          console.log('Received DELETE payload:', payload);
          const deletedMessageId = payload.old?.id; // Check if payload.old exists
          if (deletedMessageId) {
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== deletedMessageId)
            );
          } else {
            console.error('DELETE payload missing old data:', payload);
          }
        }
      )
      
      
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to real-time updates for channel: ${channelId}`);
        } else {
          console.error(`Subscription error: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          content: newMessage.trim(),
          project_id: projectId,
          user_id: currentUser.id,
          channel_id: channelId,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error sending message:', error.message);
      } else {
        setNewMessage('');
      }
    } catch (err) {
      console.error('Unexpected error sending message:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) {
        console.error('Error deleting message:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error deleting message:', err);
    }
  };

  const editMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: editedContent, edited: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error editing message:', error.message);
      } else {
        setEditingMessageId(null);
        setEditedContent('');
      }
    } catch (err) {
      console.error('Unexpected error editing message:', err);
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
              message.user_id === currentUser.id ? styles.yourMessage : styles.otherMessage
            }`}
          >
            <div className={styles.messageInfo}>
              <span className={styles.userName}>{message.users?.email || 'Loading...'}</span>
              <span className={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {editingMessageId === message.id ? (
              <div className={styles.editContainer}>
                <input
                  type="text"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className={styles.editInput}
                />
                <button onClick={() => editMessage(message.id)}>Save</button>
                <button onClick={() => setEditingMessageId(null)}>Cancel</button>
              </div>
            ) : (
              <p className={styles.messageText}>
                {message.content} {message.edited && <span className={styles.editedLabel}>(edited)</span>}
              </p>
            )}
            {message.user_id === currentUser.id && (
              <div className={styles.options}>
                <button onClick={() => setIsMenuOpen(isMenuOpen === message.id ? null : message.id)}>
                  Options
                </button>
                {isMenuOpen === message.id && (
                  <div className={styles.optionsMenu}>
                    <button onClick={() => {
                      setEditingMessageId(message.id);
                      setEditedContent(message.content);
                    }}>Edit</button>
                    <button onClick={() => deleteMessage(message.id)}>Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
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
