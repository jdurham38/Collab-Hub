'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSend: (message: string) => void;
  initialValue?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, initialValue = '' }) => {
    const [newMessage, setNewMessage] = useState<string>(initialValue);
    const inputRef = useRef<HTMLTextAreaElement>(null);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

  const sendMessage = () => {
        if (newMessage.trim() !== '') {
             onSend(newMessage);
           setNewMessage(''); 
           if (inputRef.current) {
               inputRef.current.style.height = 'auto';
               inputRef.current.focus();
           }
        }
    };
 const handleInputResize = () => {
        if(inputRef.current){
          inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    };


    return (
          <div className={styles.messageInputWrapper}>
            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onInput={handleInputResize}
              className={styles.messageInput}
              ref={inputRef}
                 rows={1}
            />
            <button onClick={sendMessage} className={styles.sendButton}>
              Send
            </button>
          </div>
    );
};

export default MessageInput;