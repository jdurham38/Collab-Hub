import React, { useRef } from 'react';
import styles from './MessageInput.module.css';
import MentionSuggestions from '../MentionSuggestions/MentionSuggestions';
import { User } from '@/utils/interfaces';

interface MessageInputProps {
  newMessage: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  showSuggestions: boolean;
  userSuggestions: User[];
  onSelectSuggestion: (user: User) => void;
  editingMessageId?: string | null;
  editedContent?: string;
  onEditConfirm?: (messageId: string, editedContent: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onChange,
  onSend,
  onKeyDown,
  showSuggestions,
  userSuggestions,
  editingMessageId,
  editedContent,
  onEditConfirm,
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

        onChange(updatedMessage); // Update parent state
        textarea.focus();
        textarea.setSelectionRange(
          textBeforeAt.length + mentionText.length,
          textBeforeAt.length + mentionText.length
        );
      }
    }
  };

  return (
    <form onSubmit={onSend} className={styles.messageForm}>
      <div className={styles.messageInputWrapper}>
        <textarea
          placeholder="Type your message..."
          value={editingMessageId ? editedContent ?? '' : newMessage}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
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
      {editingMessageId && onEditConfirm && (
        <button
          type="button"
          onClick={() => onEditConfirm(editingMessageId, editedContent ?? '')}
          className={styles.editConfirmButton}
        >
          Confirm Edit
        </button>
      )}
    </form>
  );
};

export default MessageInput;
