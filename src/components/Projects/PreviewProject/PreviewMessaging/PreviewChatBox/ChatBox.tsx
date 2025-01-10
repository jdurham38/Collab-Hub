import React from 'react';
import styles from './ChatBox.module.css';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string;
}

interface ChatBoxProps {
  messages: Message[];
  onClose: () => void;
  title: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onClose, title }) => {
  return (
    <div className={styles.chatOverlay}>
      <div className={styles.chatBox}>
        <div className={styles.chatHeader}>
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.chatMessages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.user === 'You'
                  ? styles.yourMessage
                  : styles.otherMessage
              }`}
            >
              <div className={styles.messageInfo}>
                <span className={styles.userName}>{message.user}</span>
                <span className={styles.timestamp}>{message.timestamp}</span>
              </div>
              <p className={styles.messageText}>{message.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
