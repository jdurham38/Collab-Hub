
import React, { useState } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import styles from './ChatBox.module.css';

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  users: {
    username: string;
  };
}

interface ChatBoxProps {
  messages: Message[];
  onClose: () => void;
  title: string;
  projectId: string;
  currentUser: User;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onClose, title, projectId, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const supabase=getSupabaseClient();
    const { error } = await supabase.from('messages').insert([
      {
        project_id: projectId,
        user_id: currentUser.id,
        content: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

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
                message.user_id === currentUser.id ? styles.yourMessage : styles.otherMessage
              }`}
            >
              <div className={styles.messageInfo}>
                <span className={styles.userName}>{message.users.username}</span>
                <span className={styles.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className={styles.messageText}>{message.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className={styles.messageForm}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={styles.messageInput}
          />
          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;

