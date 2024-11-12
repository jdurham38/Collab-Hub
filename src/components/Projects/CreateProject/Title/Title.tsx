// Title.tsx

import React, { useState, useEffect } from 'react';
import styles from './Title.module.css';
import { profanity } from '@2toad/profanity';

interface TitleProps {
  title: string;
  setTitle: (value: string) => void;
  setTitleError: (value: string) => void;
}

const Title: React.FC<TitleProps> = ({ title, setTitle, setTitleError }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setTitleError(errorMessage);
  }, [errorMessage, setTitleError]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const trimmedValue = value.trim();

    // Update character count
    setCharCount(value.length);

    // Check for profanity
    if (profanity.exists(trimmedValue)) {
      setErrorMessage('Profanity detected in title.');
    } else if (value.length > 50) {
      setErrorMessage('Title cannot exceed 50 characters.');
    } else {
      setErrorMessage('');
    }

    // Limit title to 30 characters
    if (value.length <= 30 && !profanity.exists(trimmedValue)) {
      setTitle(value);
    }
  };

  return (
    <div className={styles.titleContainer}>
      <input
        type="text"
        placeholder="Project Title (max 30 characters)"
        value={title}
        onChange={handleTitleChange}
        className={styles.input}
      />
      <div className={styles.titleInfo}>
        <p className={styles.charCount}>{charCount}/30 characters</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Title;
