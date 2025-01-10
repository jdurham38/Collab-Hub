import React, { useState, useRef, useEffect } from 'react';
import styles from './MessageItem.module.css';
import { Message, User } from '@/utils/interfaces';

interface MessageItemProps {
  message: Message;
  currentUser: User;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  userMap: { [key: string]: User };
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  onEdit,
  onDelete,
  userMap,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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

  const user = message.users
    ? { username: message.users.username, email: message.users.email }
    : userMap[message.user_id];

  const userName =
    message.user_id === currentUser.id
      ? 'You'
      : user
        ? user.username || user.email
        : 'Unknown User';

  return (
    <div
      className={`${styles.messageItem} ${
        message.user_id === currentUser.id
          ? styles.yourMessage
          : styles.otherMessage
      }`}
    >
      <div className={styles.messageInfo}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName || 'Loading...'}</span>
          <span className={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {message.user_id === currentUser.id && (
          <div className={styles.options} ref={optionsRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.optionsButton}
              aria-label="Show message options"
            >
              <span className={styles.optionsText}>Options</span>
            </button>
            {isMenuOpen && (
              <div className={styles.optionsMenu}>
                <button
                  onClick={() => {
                    onEdit(message.id);
                    setIsMenuOpen(false);
                  }}
                  className={styles.optionItem}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(message.id);
                    setIsMenuOpen(false);
                  }}
                  className={styles.optionItem}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className={styles.messageText}>
        {renderMessageContent(message.content)}
        {message.edited && <span className={styles.editedLabel}>(edited)</span>}
      </p>
    </div>
  );
};

export default MessageItem;
