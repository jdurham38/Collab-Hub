'use client';

import React, { useState, useRef } from 'react';
import styles from './MessageInput.module.css';
import { User } from '@/utils/interfaces';

interface MessageInputProps {
  onSend: (message: string) => void;
  userSuggestions?: User[]; // Optional if you still need to pass this down
  initialValue?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, userSuggestions = [], initialValue = '' }) => {
  const [newMessage, setNewMessage] = useState<string>(initialValue);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1) {
      const mentionText = value.slice(lastAt + 1);
      if (/\s/.test(mentionText) || mentionText.length === 0) {
        setShowSuggestions(false);
        setMentionStartIndex(null);
        return;
      }

      setMentionStartIndex(lastAt);
      setShowSuggestions(true); // Assuming you want to show suggestions
    } else {
      setShowSuggestions(false);
      setMentionStartIndex(null);
    }
  };

  const handleSuggestionClick = (user: User) => {
    if (mentionStartIndex !== null && inputRef.current) {
      const input = inputRef.current;
      const value = newMessage;
      const beforeMention = value.slice(0, mentionStartIndex);
      const afterMention = value.slice(input.selectionStart);
      const mentionText = `@${user.username} `;
      const newValue = beforeMention + mentionText + afterMention;

      setNewMessage(newValue);
      setShowSuggestions(false);
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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSend(newMessage);
    setNewMessage(''); // Clear the input after sending
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.messageForm}>
      <div className={styles.messageInputWrapper}>
        <textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.messageInput}
          ref={inputRef}
        />
        {showSuggestions && userSuggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {/* You might need a separate component for this if it's complex */}
            <ul>
              {userSuggestions.map((user) => (
                <li key={user.id} onClick={() => handleSuggestionClick(user)}>
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button type="submit" className={styles.sendButton}>
        Send
      </button>
    </form>
  );
};

export default MessageInput;