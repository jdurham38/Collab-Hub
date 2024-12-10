'use client';

import React, { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import styles from './ChatArea.module.css';
import {
  sendDirectMessage,
  editDirectMessage,
  deleteDirectMessage,
} from '@/services/directMessageService';
import { User } from '@/utils/interfaces';
import { createClient } from '@supabase/supabase-js';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageInput from './MessageInput/MessageInput';
import EditMessageForm from './EditMessageForm/EditMessageForm';
import useCollaborators from '@/hooks/individualProjects/messages/chatArea/useCollaborators';
import useDirectMessages from '@/hooks/individualProjects/messages/sidebar/useDirectMessage';
import useDirectMessageSubscription from '@/hooks/individualProjects/messages/chatArea/useDirectMessageSubscription';
import DirectMessageList from './DirectMessageList/DirectMessageList';

interface DirectMessageChatAreaProps {
    recipient_id: string;
  projectId: string;
  currentUser: User;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const DirectMessageChatArea: React.FC<DirectMessageChatAreaProps> = ({
    recipient_id,
  projectId,
  currentUser,
}) => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newMessagesCount, setNewMessagesCount] = useState<number>(0);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef<boolean>(false);
  const allCollaborators = useCollaborators(projectId);
    const [userMap, setUserMap] = useState<{ [key: string]: User }>({});
  const {
    directMessages: messages,
    isLoading,
    error,
    setDirectMessages: setMessages,
  } = useDirectMessages(currentUser.id);

  const [receiver, setReceiver] = useState<User | null>(null);

  useEffect(() => {
    const fetchReceiverInfo = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', recipient_id)
        .single();

      if (error) {
        console.error('Error fetching receiver info:', error);
      } else {
        setReceiver(data as User);
      }
    };

    if (recipient_id) {
      fetchReceiverInfo();
    }
  }, [recipient_id]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
      setNewMessagesCount(0);
    }
  };

  const isUserAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 20;
      return Math.abs(scrollHeight - scrollTop - clientHeight) <= threshold;
    }
    return false;
  };

  useDirectMessageSubscription({
    supabase,
    initialLoadCompleted: !isLoading,
    currentUserId: currentUser.id,
    recipient_id: recipient_id,
    userMap,
    setUserMap,
    setMessages,
    scrollToBottom,
    isUserAtBottom,
    setNewMessagesCount,
  });

  const filteredMessages = useMemo(() => {
    return messages
      .filter(
        (msg) =>
          (msg.sender_id === currentUser.id && msg.recipient_id === recipient_id) ||
          (msg.sender_id === recipient_id && msg.recipient_id === currentUser.id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, currentUser.id, recipient_id]);

  useEffect(() => {
    hasInitiallyScrolled.current = false;
  }, [recipient_id]);

  useLayoutEffect(() => {
    if (!isLoading && messages.length > 0 && !hasInitiallyScrolled.current) {
      setTimeout(() => {
        scrollToBottom('auto');
        hasInitiallyScrolled.current = true;
      }, 50);
    }
  }, [isLoading, messages, recipient_id]);

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1) {
      const mentionText = value.slice(lastAt + 1);
      if (/\s/.test(mentionText) || mentionText.length === 0) {
        setShowSuggestions(false);
        setUserSuggestions([]);
        setMentionStartIndex(null);
        return;
      }
    //   const filteredSuggestions = allCollaborators.filter((user) =>
    //     user.username.toLowerCase().startsWith(mentionText.toLowerCase())
    // );
    //   setUserSuggestions(filteredSuggestions);
    //   setShowSuggestions(filteredSuggestions.length > 0);
      setMentionStartIndex(lastAt);
    } else {
      setShowSuggestions(false);
      setUserSuggestions([]);
      setMentionStartIndex(null);
    }
  };

  const handleSuggestionClick = (user: User) => {
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
      await sendDirectMessage(projectId, recipient_id, newMessage.trim(), currentUser.id);
      if (wasAtBottom) {
        scrollToBottom('smooth');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
    setNewMessage('');
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
      await editDirectMessage(messageId, editedContent);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, content: editedContent, edited: true } : msg
        )
      );
      setEditingMessageId(null);
      setEditedContent('');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteDirectMessage(messageId);
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
  };

  return (
    <div className={styles.chatArea}>
      <ChatHeader chatTitle={receiver ? `DM: ${receiver.username || receiver.email}` : 'Loading...'} />
      <div className={styles.chatMessages} ref={messagesContainerRef}>
        {isLoading && <p className={styles.loading}>Loading messages...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {!isLoading && !error && (
          <DirectMessageList
            messages={filteredMessages}
            currentUser={currentUser}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            userMap={userMap}
          />
        )}
      </div>
      {newMessagesCount > 0 && !isUserAtBottom() && (
        <div
          className={styles.newMessagesIndicator}
          onClick={() => {
            scrollToBottom('smooth');
            setNewMessagesCount(0);
          }}
          role="button"
          aria-label="There are new messages"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              scrollToBottom('smooth');
              setNewMessagesCount(0);
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

export default DirectMessageChatArea;