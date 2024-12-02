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
import EditMessageForm from './EditMessageForm/EditMessageForm';

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [, setMentionQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [newMessagesCount, setNewMessagesCount] = useState<number>(0);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});

  const previousMessagesRef = useRef<Message[]>([]);
  const isInitialLoadRef = useRef(true);
  const [initialLoadCompleted, setInitialLoadCompleted] = useState<boolean>(false);

  useEffect(() => {
    isInitialLoadRef.current = true;
    setNewMessagesCount(0);
    previousMessagesRef.current = [];
    setInitialLoadCompleted(false);
  }, [channelId]);

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

  useEffect(() => {
    const map = allCollaborators.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as { [key: string]: User });

    if (currentUser && !map[currentUser.id]) {
      map[currentUser.id] = currentUser;
    }

    setUserMap(map);
  }, [allCollaborators, currentUser]);

  useEffect(() => {
    const fetchMessagesData = async () => {
      setIsLoading(true);
      setError(null);
      isInitialLoadRef.current = true;
  
      try {
        const messagesData = await fetchMessages(projectId, channelId);
        const uniqueUserIds = Array.from(new Set(messagesData.map((msg) => msg.user_id)));
        const missingUserIds = uniqueUserIds.filter((uid) => !userMap[uid]);
  
        if (missingUserIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, email')
            .in('id', missingUserIds);
  
          if (usersError) {
            console.error('Error fetching missing users:', usersError.message);
          } else if (usersData) {
            const newUserMapEntries = (usersData as User[]).reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as { [key: string]: User });
  
            setUserMap((prev) => ({ ...prev, ...newUserMapEntries }));
          }
        }
  
        const messagesWithUser = messagesData.map((message) => {
          const user = userMap[message.user_id];
          return {
            ...message,
            users: user || { username: 'Unknown User', email: '' },
          };
        });
  
        setMessages(messagesWithUser);
        setIsLoading(false);
        setInitialLoadCompleted(true); // Trigger the scroll effect
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages.');
        setIsLoading(false);
      }
    };
  
    if (Object.keys(userMap).length > 0) {
      fetchMessagesData();
    }
  }, [projectId, channelId, userMap]);
  

  useEffect(() => {
    if (initialLoadCompleted && isInitialLoadRef.current && messagesContainerRef.current) {
      const scrollToBottomOnInitialLoad = () => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
        isInitialLoadRef.current = false; // Mark the initial scroll as done
      };
  

      setTimeout(scrollToBottomOnInitialLoad, 500);
    }
  }, [initialLoadCompleted, messages]);
  
  
  

  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setNewMessagesCount(0); // Reset the new message count when the user explicitly scrolls to the bottom
  };
  
  

  const isUserAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 20; // A smaller threshold ensures the user is truly at the bottom
      return Math.abs(scrollHeight - scrollTop - clientHeight) <= threshold;
    }
    return false;
  };
  
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1) {
      const mentionText = value.slice(lastAt + 1);
      if (/\s/.test(mentionText) || mentionText.length === 0) {
        setShowSuggestions(false);
        setUserSuggestions([]);
        setMentionStartIndex(null);
        setMentionQuery('');
        return;
      }

      setMentionQuery(mentionText);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      e.preventDefault();
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
  

    const wasAtBottom = isUserAtBottom();
  
    try {
      await sendMessage(projectId, channelId, newMessage.trim(), currentUser.id);
      setNewMessage('');
  

      if (wasAtBottom) {
        scrollToBottom('smooth');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  const handleEditMessage = (messageId: string) => {
    setEditingMessageId(messageId);
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setEditedContent(message.content);
    }
  };

  const handleEditConfirm = async (messageId: string, editedContent: string) => {
    if (editedContent.trim()) {
      try {
        await editMessage(messageId, editedContent);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content: editedContent, edited: true } : msg
          )
        );
        setEditingMessageId(null);
        setEditedContent('');
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }
  };

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

  useEffect(() => {
    if (!initialLoadCompleted) return;
  
    const channel: RealtimeChannel = supabase.channel(`public:messages:channel_id=eq.${channelId}`);
  
    const handleInsert = async (payload: any) => {
      const newMessage = payload.new as Message;
    

      if (messages.some((msg) => msg.id === newMessage.id)) return;
    
      let user = userMap[newMessage.user_id];
      if (!user) {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, email')
          .eq('id', newMessage.user_id)
          .single();
    
        if (error) {
          console.error('Error fetching user:', error);
          user = { id: newMessage.user_id, username: 'Unknown User', email: '' };
        } else {
          user = data;
          setUserMap((prev) => ({ ...prev, [user.id]: user }));
        }
      }
    
      const isAtBottomNow = isUserAtBottom();
    

      setMessages((prevMessages) =>
        [...prevMessages, { ...newMessage, users: user }]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      );
    
      if (!isAtBottomNow && newMessage.user_id !== currentUser.id) {
        setNewMessagesCount((prev) => prev + 1);
      }
    
      if (isAtBottomNow) {
        scrollToBottom();
      }
    };
    
  

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        handleInsert
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
          const user = userMap[updatedMessage.user_id] || { username: 'Unknown User', email: '' };
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === updatedMessage.id ? { ...updatedMessage, users: user } : msg
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
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== deletedMessageId));
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
  }, );
  
  useEffect(() => {
    if (!messagesContainerRef.current) return;
  
    const previousMessages = previousMessagesRef.current;
    const newMessages = sortedMessages.filter(
      (msg) => !previousMessages.some((prevMsg) => prevMsg.id === msg.id)
    );
  
    previousMessagesRef.current = sortedMessages;
  
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
  
    const isAtBottomNow = isUserAtBottom();
  
    if (newMessages.length > 0) {
      const hasNewMessageFromOtherUser = newMessages.some(
        (msg) => msg.user_id !== currentUser.id
      );
  
      if (!isAtBottomNow && hasNewMessageFromOtherUser) {

        setNewMessagesCount((prev) => Math.max(prev + newMessages.length, 0));
      }
    }
  }, [sortedMessages, currentUser.id]);
  

  const userIsScrollingRef = useRef(false); // New ref for user scroll intent

  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
  

        userIsScrollingRef.current = !(scrollHeight - scrollTop - clientHeight <= 20);
  

        if (!userIsScrollingRef.current && newMessagesCount > 0) {
          setNewMessagesCount(0);
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

      {newMessagesCount > 0 && !isUserAtBottom() && (
        <div
          className={styles.newMessagesIndicator}
          onClick={() => {
            scrollToBottom('smooth');
            setNewMessagesCount(0); // Reset indicator on click
          }}
          role="button"
          aria-label={`There are new messages`}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              scrollToBottom('smooth');
            }
          }}
        >
          <span style={{ marginRight: '8px' }}>⬆</span>
          There are new messages!
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
        />
      )}
    </div>
  );
};

export default ChatArea;
