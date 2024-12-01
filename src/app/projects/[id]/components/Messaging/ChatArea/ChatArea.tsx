// File: components/ChatArea/ChatArea.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './ChatArea.module.css';
import {
  fetchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from '@/services/messageService';
import { fetchProjectCollaborators } from '@/services/collaboratorService';
import { Message, User } from '@/utils/interfaces';
import { RealtimeChannel, createClient } from '@supabase/supabase-js';

interface ChatAreaProps {
  chatTitle: string;
  projectId: string;
  currentUser: User;
  channelId: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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

useEffect(() => {
  const fetchCollaboratorsData = async () => {
    try {
      if (!projectId || typeof projectId !== 'string') {
        throw new Error('Invalid project ID');
      }

      const collaborators = await fetchProjectCollaborators(projectId);
      setAllCollaborators(collaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  fetchCollaboratorsData();
}, [projectId]);

  

  // Create a user map
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    const map = allCollaborators.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as { [key: string]: User });
  
    // Ensure currentUser is included
    if (currentUser && !map[currentUser.id]) {
      map[currentUser.id] = currentUser;
    }
  
    setUserMap(map);
  }, [allCollaborators, currentUser]);
  

  // Fetch messages
  useEffect(() => {
    const fetchMessagesData = async () => {
      try {
        const messagesData = await fetchMessages(projectId, channelId);
        const messagesWithUser = messagesData.map((message) => {
          const user = userMap[message.user_id];
          if (user) {
            message.users = { username: user.username, email: user.email };
          }
          return message;
        });
        setMessages(messagesWithUser);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessagesData();
  }, [projectId, channelId, userMap]);

  // Subscribe to real-time updates
  useEffect(() => {
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
        let user = userMap[newMessage.user_id];
  
        if (user) {
          newMessage.users = { username: user.username, email: user.email };
        } else {
          // Fetch user data if not in userMap
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, username, email')
              .eq('id', newMessage.user_id)
              .single();
  
            if (userError || !userData) {
              console.error('Error fetching user data:', userError?.message || 'No user data');
              newMessage.users = { username: 'Unknown User', email: '' };
            } else {
              user = { id: userData.id, username: userData.username, email: userData.email };
              newMessage.users = { username: user.username, email: user.email };
              // Update userMap with the new user data
              setUserMap((prevUserMap) => ({
                ...prevUserMap,
                [user.id]: user,
              }));
            }
          } catch (error) {
            console.error('Unexpected error fetching user data:', error);
            newMessage.users = { username: 'Unknown User', email: '' };
          }
        }
  
        setMessages((prevMessages) =>
          [...prevMessages, newMessage].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
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
          const user = userMap[updatedMessage.user_id];
          if (user) {
            updatedMessage.users = { username: user.username, email: user.email };
          }
          setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
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
  }, [channelId, userMap]);

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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();

    try {
      await sendMessage(projectId, channelId, messageContent, currentUser.id);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    try {
      await editMessage(messageId, editedContent);
      setEditingMessageId(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error editing message:', error);
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
                <button onClick={() => handleEditMessage(message.id)}>Save</button>
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
                <button
                  onClick={() => setIsMenuOpen(isMenuOpen === message.id ? null : message.id)}
                >
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
                    <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
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
