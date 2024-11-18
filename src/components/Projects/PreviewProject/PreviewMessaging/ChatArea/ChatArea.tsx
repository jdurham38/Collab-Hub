import React from 'react';
import styles from './ChatArea.module.css';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string;
}

interface ChatAreaProps {
    messages: Message[];
    chatTitle: string;
  }
  

const ChatArea: React.FC<ChatAreaProps> = ({ messages, chatTitle }) => {
  return (
    <div className={styles.chatArea}>
      <div className={styles.chatHeader}>
        <h3>{chatTitle}</h3>
      </div>
      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.user === 'You' ? styles.yourMessage : styles.otherMessage
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
  );
};

export default ChatArea;
