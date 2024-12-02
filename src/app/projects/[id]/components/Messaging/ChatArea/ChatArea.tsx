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
import ChatHeader from './ChatHeader/ChatHeader';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import EditMessageForm from './EditMessageForm/EditMessageForm'; // Import EditMessageForm

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
  // Existing States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [, setMentionQuery] = useState(''); // Capture the mention query
  const [newMessage, setNewMessage] = useState(''); // Holds the new message input

  // New State for Tracking New Messages
  const [newMessagesCount, setNewMessagesCount] = useState<number>(0);

  // States for Messages, Loading, and Error
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null); // Ref to messages container

  // Create a user map
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});

  // Ref to track previous messages
  const previousMessagesRef = useRef<Message[]>([]);

  // Fetch Project Collaborators
  useEffect(() => {
    const fetchCollaboratorsData = async () => {
      try {
        if (!projectId || typeof projectId !== 'string') {
          throw new Error('Invalid project ID');
        }
        const collaborators = await fetchProjectCollaborators(projectId);
        console.log('Fetched Collaborators:', collaborators);
        setAllCollaborators(collaborators);
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      }
    };

    fetchCollaboratorsData();
  }, [projectId]);

  // Update userMap when collaborators or currentUser change
  useEffect(() => {
    const map = allCollaborators.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as { [key: string]: User });

    if (currentUser && !map[currentUser.id]) {
      map[currentUser.id] = currentUser;
    }

    setUserMap(map);

    // Debugging: Log the userMap
    console.log('Updated userMap:', map);
  }, [allCollaborators, currentUser]);

  // Fetch Messages
  useEffect(() => {
    const fetchMessagesData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const messagesData = await fetchMessages(projectId, channelId);

        // Identify unique user_ids from messages
        const uniqueUserIds = Array.from(new Set(messagesData.map((msg) => msg.user_id)));

        // Determine which user_ids are missing in userMap
        const missingUserIds = uniqueUserIds.filter((uid) => !userMap[uid]);

        // Fetch missing users from Supabase
        if (missingUserIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, email')
            .in('id', missingUserIds);

          if (usersError) {
            console.error('Error fetching missing users:', usersError.message);
          } else if (usersData) {
            // Create a map for the fetched users
            const newUserMapEntries = (usersData as User[]).reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as { [key: string]: User });

            // Update userMap with the newly fetched users
            setUserMap((prev) => ({ ...prev, ...newUserMapEntries }));

            // Assign user data to messages
            messagesData.forEach((msg) => {
              if (newUserMapEntries[msg.user_id]) {
                msg.users = {
                  username: newUserMapEntries[msg.user_id].username,
                  email: newUserMapEntries[msg.user_id].email,
                };
              }
            });
          }
        }

        // Assign user data to messages from userMap
        const messagesWithUser = messagesData.map((message) => {
          const user = message.users
            ? {
                username: message.users.username,
                email: message.users.email,
              }
            : userMap[message.user_id];
          if (user) {
            message.users = {
              username: user.username,
              email: user.email,
            };
          }
          return message;
        });

        setMessages(messagesWithUser);
        setIsLoading(false);
        scrollToBottom(); // Scroll to bottom after initial load
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages.');
        setIsLoading(false);
      }
    };

    // Only fetch messages after userMap is populated
    if (Object.keys(userMap).length > 0) {
      fetchMessagesData();
    }
  }, [projectId, channelId, userMap]);

  // Sorting messages by timestamp ascending (oldest first)
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessagesCount(0);
    console.log('Scrolled to bottom.');
  };

  // Helper function to check if user is at the bottom
  const isUserAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 50; // Pixels from the bottom to consider "at the bottom"
      const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= threshold;
      console.log(
        `isUserAtBottom: ${atBottom} (scrollTop: ${scrollTop}, scrollHeight: ${scrollHeight}, clientHeight: ${clientHeight})`
      );
      return atBottom;
    }
    return false;
  };

  // Handle input change and mention detection
  const handleInputChange = (value: string) => {
    setNewMessage(value);

    // Detect if user is typing a mention
    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1) {
      const mentionText = value.slice(lastAt + 1);
      if (/\s/.test(mentionText) || mentionText.length === 0) {
        // No active mention
        setShowSuggestions(false);
        setUserSuggestions([]);
        setMentionStartIndex(null);
        setMentionQuery('');
        return;
      }

      setMentionQuery(mentionText);

      // Filter collaborators based on mentionText
      const filteredSuggestions = allCollaborators.filter((user) =>
        user.username.toLowerCase().startsWith(mentionText.toLowerCase())
      );

      setUserSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
      setMentionStartIndex(lastAt);
    } else {
      setShowSuggestions(false);
      setUserSuggestions([]);
      setMentionStartIndex(null);
      setMentionQuery('');
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (user: User): void => {
    if (mentionStartIndex !== null && messageInputRef.current) {
      const input = messageInputRef.current;
      const value = newMessage;
      const beforeMention = value.slice(0, mentionStartIndex);
      const afterMention = value.slice(input.selectionStart);

      const mentionText = `@${user.username} `;
      const newValue = beforeMention + mentionText + afterMention;

      setNewMessage(newValue);
      setShowSuggestions(false);
      setUserSuggestions([]);
      setMentionQuery('');
      setMentionStartIndex(null);

      const newCursorPosition = beforeMention.length + mentionText.length;
      input.focus();
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  };

  // Handle key events for navigation (optional)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      e.preventDefault();
      // Implement navigation through suggestions if desired
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const wasAtBottom = isUserAtBottom(); // Check if user was at bottom before sending
    console.log(`Was at bottom before sending: ${wasAtBottom}`);

    try {
      await sendMessage(projectId, channelId, newMessage.trim(), currentUser.id);
      setNewMessage('');

      if (wasAtBottom) {
        scrollToBottom(); // Only scroll if user was already at bottom
      }
      // If not at bottom, `newMessagesCount` will be updated via real-time updates
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle editing a message
  const handleEditMessage = (messageId: string) => {
    setEditingMessageId(messageId);
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setEditedContent(message.content); // Set the content to be edited
    }
  };

  // Confirm editing a message
  const handleEditConfirm = async (messageId: string, editedContent: string) => {
    if (editedContent.trim()) {
      try {
        await editMessage(messageId, editedContent); // Update the message via the API
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content: editedContent, edited: true } : msg
          )
        );
        setEditingMessageId(null); // Clear editing state
        setEditedContent(''); // Clear the content after save
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Real-Time Updates with Supabase
useEffect(() => {
  const channel: RealtimeChannel = supabase.channel(`public:messages:channel_id=eq.${channelId}`);


  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      async (payload) => { // Make the callback async
        const newMessage = payload.new as Message;

        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg.id === newMessage.id);
          if (messageExists) {
            console.log(`Duplicate message detected: ${newMessage.id}. Skipping addition.`);
            return prevMessages;
          }

          let user = userMap[newMessage.user_id];
          if (user) {
            newMessage.users = { username: user.username, email: user.email };
            return [...prevMessages, newMessage].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          } else {
            // Start an async operation without making setMessages callback async
            (async () => {
              try {
                const { data, error } = await supabase
                  .from('users')
                  .select('id, username, email')
                  .eq('id', newMessage.user_id)
                  .single();

                if (error || !data) {
                  console.error('Error fetching user data:', error?.message || 'No user data');
                  newMessage.users = { username: 'Unknown User', email: '' };
                } else {
                  user = { id: data.id, username: data.username, email: data.email };
                  newMessage.users = { username: user.username, email: user.email };
                  setUserMap((prev) => ({
                    ...prev,
                    [user.id]: user,
                  }));
                }

                setMessages((currentMessages) =>
                  [...currentMessages, newMessage].sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  )
                );
              } catch (err) {
                console.error('Unexpected error fetching user data:', err);
                newMessage.users = { username: 'Unknown User', email: '' };
                setMessages((currentMessages) =>
                  [...currentMessages, newMessage].sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  )
                );
              }
            })();

            return prevMessages; // Return synchronously to avoid making the callback async
          }
        });

        console.log(`New message added: ${newMessage.id} from user ${newMessage.user_id}`);
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
      (payload) => {
        const updatedMessage = payload.new as Message;
        const user = userMap[updatedMessage.user_id];
        if (user) {
          updatedMessage.users = { username: user.username, email: user.email };
        }
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
        );
        console.log(`Message updated: ${updatedMessage.id}`);
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
          console.log(`Message deleted: ${deletedMessageId}`);
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


  // Effect to track new messages and update newMessagesCount
  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const isAtBottom = isUserAtBottom();

    const previousMessages = previousMessagesRef.current;
    const newMessages = sortedMessages.filter(
      (msg) => !previousMessages.some((prevMsg) => prevMsg.id === msg.id)
    );

    if (newMessages.length > 0) {
      // Check if any new message is from another user
      const hasNewMessageFromOtherUser = newMessages.some(
        (msg) => msg.user_id !== currentUser.id
      );

      console.log(`New messages received: ${newMessages.length}`);
      console.log(`Has new message from other user: ${hasNewMessageFromOtherUser}`);

      if (hasNewMessageFromOtherUser) {
        if (isAtBottom) {
          console.log('User is at bottom. Scrolling to bottom.');
          scrollToBottom(); // Scroll if user was already at bottom
        } else {
          console.log('User is NOT at bottom. Incrementing newMessagesCount.');
          setNewMessagesCount((prev) => prev + newMessages.length);
        }
      }
    }

    // Update the previous messages ref
    previousMessagesRef.current = sortedMessages;
  }, [sortedMessages, currentUser.id]);

  // Separate useEffect to handle manual scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (isUserAtBottom()) {
        if (newMessagesCount > 0) {
          setNewMessagesCount(0);
          console.log('User scrolled to bottom manually. newMessagesCount reset to 0.');
        }
      }
    };

    const container = messagesContainerRef.current;
    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [newMessagesCount]);

  return (
    <div className={styles.chatArea}>
      <ChatHeader chatTitle={chatTitle} />

      <div className={styles.chatMessages} ref={messagesContainerRef}>
        {isLoading && <p className={styles.loading}>Loading messages...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {!isLoading && !error && (
          <MessageList
            messages={sortedMessages}
            currentUser={currentUser}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            userMap={userMap}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* New Messages Indicator */}
      {newMessagesCount > 0 && (
        <div
          className={styles.newMessagesIndicator}
          onClick={scrollToBottom}
          role="button"
          aria-label={`Scroll to bottom to view ${newMessagesCount} new message${newMessagesCount > 1 ? 's' : ''}`}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              scrollToBottom();
            }
          }}
        >
          {/* Optional: Add an icon for better UX */}
          <span style={{ marginRight: '8px' }}>⬆️</span>
          {newMessagesCount} new message{newMessagesCount > 1 ? 's' : ''}
        </div>
      )}

      {editingMessageId ? (
        <EditMessageForm
          messageId={editingMessageId}
          currentContent={editedContent}
          onEditConfirm={handleEditConfirm}
          onCancel={() => setEditingMessageId(null)}
        />
      ) : (
        <MessageInput
          newMessage={newMessage}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
          showSuggestions={showSuggestions}
          userSuggestions={userSuggestions}
          onSelectSuggestion={handleSuggestionClick}
          // Remove editing-related props since handled in parent
        />
      )}
    </div>
  );
};

export default ChatArea;
