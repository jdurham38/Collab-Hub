import React, { useRef } from 'react';
import styles from './MessageInput.module.css';
import MentionSuggestions from '../MentionSuggestions/MentionSuggestions';
import { User } from '@/utils/interfaces';

interface MessageInputProps {
  newMessage: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent<HTMLFormElement>) => void;
  showSuggestions: boolean;
  userSuggestions: User[];
  onSelectSuggestion: (user: User) => void;
  editingMessageId?: string | null;
  editedContent?: string;
  onEditConfirm?: (messageId: string, editedContent: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onChange,
  onSend,
  showSuggestions,
  userSuggestions,
  editingMessageId,
  editedContent,
  onEditConfirm,
  onKeyDown,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestionClick = (user: User) => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      const cursorPosition = textarea.selectionStart;

      const atIndex = newMessage.lastIndexOf('@', cursorPosition - 1);

      if (atIndex !== -1) {
        const textBeforeAt = newMessage.slice(0, atIndex);
        const textAfterCursor = newMessage.slice(cursorPosition);

        const mentionText = `@${user.username} `;
        const updatedMessage = `${textBeforeAt}${mentionText}${textAfterCursor}`;

        onChange(updatedMessage);
        textarea.focus();
        textarea.setSelectionRange(
          textBeforeAt.length + mentionText.length,
          textBeforeAt.length + mentionText.length,
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = inputRef.current?.closest('form');
      if (form) form.requestSubmit();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingMessageId && onEditConfirm && editedContent) {
      onEditConfirm(editingMessageId, editedContent);
    } else {
      onSend(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.messageForm}>
      <div className={styles.messageInputWrapper}>
        <textarea
          placeholder="Type your message..."
          value={editingMessageId ? (editedContent ?? '') : newMessage}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.messageInput}
          ref={inputRef}
        />
        {showSuggestions && userSuggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            <MentionSuggestions
              suggestions={userSuggestions}
              onSelect={handleSuggestionClick}
            />
          </div>
        )}
      </div>
      <button type="submit" className={styles.sendButton}>
        {editingMessageId ? 'Confirm Edit' : 'Send'}
      </button>
    </form>
  );
};

export default MessageInput;
