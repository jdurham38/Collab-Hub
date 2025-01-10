import React, { useState, useRef, useMemo, useEffect } from 'react';
import styles from './ChatArea.module.css';
import {
  sendMessage,
  editMessage,
  deleteMessage,
} from '@/services/messageService';
import { User } from '@/utils/interfaces';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import EditMessageForm from './EditMessageForm/EditMessageForm';
import useCollaborators from '@/hooks/individualProjects/messages/chatArea/useCollaborators';
import useMessages from '@/hooks/individualProjects/messages/chatArea/useMessages';
import useMessageSubscription from '@/hooks/individualProjects/messages/chatArea/useMessageSubscription';
import getSupabaseClient from '@/lib/supabaseClient/supabase';

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newMessagesCount, setNewMessagesCount] = useState<number>(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null,
  );
  const [filterText, setFilterText] = useState('');
  const [firstLoad, setFirstLoad] = useState(true);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);
  const supabase = getSupabaseClient();

  const { filteredCollaborators } = useCollaborators(projectId, filterText);
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});
  const { messages, isLoading, error, setMessages, initialLoadCompleted } =
    useMessages(projectId, channelId, userMap, setUserMap);

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
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const threshold = 20;
      return Math.abs(scrollHeight - scrollTop - clientHeight) <= threshold;
    }
    return false;
  };

  useMessageSubscription({
    initialLoadCompleted,
    channelId,
    currentUserId: currentUser.id,
    userMap,
    setUserMap,
    setMessages,
    setNewMessagesCount,
    scrollToBottom,
    isUserAtBottom,
    supabase,
  });

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [messages]);

  useEffect(() => {
    hasInitiallyScrolled.current = false;
    setFirstLoad(true);
  }, [channelId]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      if (firstLoad) {
        scrollToBottom('auto');
        hasInitiallyScrolled.current = true;
        setFirstLoad(false);
      } else if (!hasInitiallyScrolled.current && isUserAtBottom()) {
        scrollToBottom('auto');
        hasInitiallyScrolled.current = true;
      }
    }
  }, [isLoading, messages, channelId, firstLoad]);

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1) {
      const mentionText = value.slice(lastAt + 1);
      if (/\s/.test(mentionText) || mentionText.length === 0) {
        setShowSuggestions(false);
        setMentionStartIndex(null);
        setFilterText('');
        return;
      }

      setFilterText(mentionText);
      setShowSuggestions(true);
      setMentionStartIndex(lastAt);
    } else {
      setShowSuggestions(false);
      setMentionStartIndex(null);
      setFilterText('');
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
      setFilterText('');
      setMentionStartIndex(null);
      const newCursorPosition = beforeMention.length + mentionText.length;
      input.focus();
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      showSuggestions &&
      (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')
    ) {
      e.preventDefault();
    }
  };
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const wasAtBottom = isUserAtBottom();

    try {
      await sendMessage(
        projectId,
        channelId,
        newMessage.trim(),
        currentUser.id,
      );

      if (wasAtBottom) {
        setTimeout(() => {
          scrollToBottom('smooth');
        }, 0);
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

  const handleEditConfirm = async (
    messageId: string,
    editedContent: string,
  ) => {
    if (editedContent.trim()) {
      await editMessage(messageId, editedContent);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: editedContent, edited: true }
            : msg,
        ),
      );
      setEditingMessageId(null);
      setEditedContent('');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== messageId),
    );
  };

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
          userSuggestions={filteredCollaborators || []}
          onSelectSuggestion={handleSuggestionClick}
        />
      )}
    </div>
  );
};

export default ChatArea;
