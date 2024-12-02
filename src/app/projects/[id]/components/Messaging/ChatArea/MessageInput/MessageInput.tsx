// File: components/MessageInput/MessageInput.tsx

import React from 'react';
import styles from './MessageInput.module.css';
import MentionSuggestions from '../MentionSuggestions/MentionSuggestions'; // Import MentionSuggestions
import { User } from '@/utils/interfaces';

interface MessageInputProps {
  newMessage: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  showSuggestions: boolean;
  userSuggestions: User[];
  onSelectSuggestion: (user: User) => void;
  editingMessageId?: string | null; // Optional prop for message editing
  editedContent?: string; // Optional prop for edited content
  onEditConfirm?: (messageId: string, editedContent: string) => void; // Update function signature
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onChange,
  onSend,
  onKeyDown,
  showSuggestions,
  userSuggestions,
  onSelectSuggestion,
  editingMessageId,
  editedContent,
  onEditConfirm,
}) => {
  // Ensure editedContent is a string when editingMessageId is present
  const safeEditedContent = editingMessageId ? (editedContent ?? '') : '';

  return (
    <form onSubmit={onSend} className={styles.messageForm}>
      <div className={styles.messageInputWrapper}>
        <textarea
          placeholder="Type your message..."
          value={editingMessageId ? safeEditedContent : newMessage}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={styles.messageInput}
          ref={editingMessageId ? undefined : undefined} // Manage refs if necessary
        />
        {showSuggestions && userSuggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            <MentionSuggestions
              suggestions={userSuggestions}
              onSelect={onSelectSuggestion}
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
          onClick={() => onEditConfirm(editingMessageId, safeEditedContent)}
          className={styles.editConfirmButton}
        >
          Confirm Edit
        </button>
      )}
    </form>
  );
};

export default MessageInput;
