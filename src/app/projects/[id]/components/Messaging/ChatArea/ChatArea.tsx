// File: components/ChatArea/ChatArea.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import styles from './ChatArea.module.css';
import { fetchProjectCollaborators } from '@/services/IndividualProjects/projectCollaborators';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  channel_id: string;
  edited?: boolean;
  users?: {
    email: string;
    username: string;
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
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const supabase = getSupabaseClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Fetch collaborators on mount
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const collaborators = await fetchProjectCollaborators(projectId);
        setAllCollaborators(collaborators);
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      }
    };

    fetchCollaborators();
  }, [projectId]);

  // Create a user map
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    const map = allCollaborators.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as { [key: string]: User });
    setUserMap(map);
  }, [allCollaborators]);

  // Fetch messages and subscribe to real-time updates
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*, users(username, email)')
          .eq('channel_id', channelId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error.message);
          setMessages([]);
        } else {
          // Attach user data from userMap
          const messagesWithUser = messagesData?.map((message) => {
            const user = userMap[message.user_id];
            if (user) {
              message.users = { username: user.username, email: user.email };
            }
            return message;
          });
          setMessages(messagesWithUser ?? []);
        }
      } catch (err) {
        console.error('Unexpected error fetching messages:', err);
        setMessages([]);
      }
    };

    fetchMessages();

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

          // Attach user data from userMap
          const user = userMap[newMessage.user_id];
          if (user) {
            newMessage.users = { username: user.username, email: user.email };
          } else {
            // Fetch user data if not in userMap (optional)
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('username, email')
              .eq('id', newMessage.user_id)
              .single();

            if (userError) {
              console.error('Error fetching user data:', userError.message);
              newMessage.users = { username: 'Unknown User', email: '' };
            } else {
              newMessage.users = { username: userData.username, email: userData.email };
            }
          }

          setMessages((prevMessages) =>
            [...prevMessages, newMessage].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          );
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

          // Attach user data from userMap
          const user = userMap[updatedMessage.user_id];
          if (user) {
            updatedMessage.users = { username: user.username, email: user.email };
          } else {
            // Fetch user data if not in userMap (optional)
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('username, email')
              .eq('id', updatedMessage.user_id)
              .single();

            if (userError) {
              console.error('Error fetching user data:', userError.message);
              updatedMessage.users = { username: 'Unknown User', email: '' };
            } else {
              updatedMessage.users = { username: userData.username, email: userData.email };
            }
          }

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
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
          const deletedMessageId = payload.old?.id;
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
  }, [channelId, supabase, userMap]);

  // Handle input changes and mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);

    const mentionMatch = /@([a-zA-Z0-9_-]*)$/.exec(textBeforeCursor);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionStartIndex(cursorPosition - query.length - 1); // -1 for '@'
      if (query.length > 0) {
        const filteredUsers = allCollaborators.filter(
          (user) =>
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        setUserSuggestions(filteredUsers);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setUserSuggestions(allCollaborators);
      }
    } else {
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartIndex(null);
    }
  };

  const handleSuggestionClick = (user: User) => {
    if (mentionStartIndex !== null && messageInputRef.current) {
      const input = messageInputRef.current;
      const value = newMessage;
      const beforeMention = value.slice(0, mentionStartIndex);
      const afterMention = value.slice(input.selectionStart);

      // Insert the mention at the correct position
      const mentionText = `@${user.username} `; // Add space after mention
      const newValue = beforeMention + mentionText + afterMention;

      setNewMessage(newValue);
      setShowSuggestions(false);
      setUserSuggestions([]);
      setMentionQuery('');
      setMentionStartIndex(null);

      // Move cursor to after the inserted mention
      const newCursorPosition = beforeMention.length + mentionText.length;
      input.focus();
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        // Implement keyboard navigation in suggestions if needed
      }
    }
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();

    try {
      const { error } = await supabase.from('messages').insert([
        {
          content: messageContent,
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

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@[a-zA-Z0-9_-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className={styles.mention}>
            {part}
          </span>
        );
      }
      return part;
    });
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
              <span className={styles.userName}>
                {message.users?.username || message.users?.email || 'Loading...'}
              </span>
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
                {renderMessageContent(message.content)}
                {message.edited && <span className={styles.editedLabel}>(edited)</span>}
              </p>
            )}
            {message.user_id === currentUser.id && (
              <div className={styles.options}>
                <button onClick={() => setIsMenuOpen(isMenuOpen === message.id ? null : message.id)}>
                  Options
                </button>
                {isMenuOpen === message.id && (
                  <div className={styles.optionsMenu}>
                    <button
                      onClick={() => {
                        setEditingMessageId(message.id);
                        setEditedContent(message.content);
                      }}
                    >
                      Edit
                    </button>
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
        <div className={styles.messageInputWrapper}>
          <textarea
            ref={messageInputRef}
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={styles.messageInput}
          />
          {showSuggestions && userSuggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {userSuggestions.map((user) => (
                <li key={user.id} onClick={() => handleSuggestionClick(user)}>
                  {user.username || user.email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
