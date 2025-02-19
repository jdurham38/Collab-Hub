import React from 'react';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
  chatTitle: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatTitle }) => {
  return (
    <div className={styles.chatHeader}>
      <h3 className={styles.title}>{chatTitle}</h3>
      {}
    </div>
  );
};

export default ChatHeader;
