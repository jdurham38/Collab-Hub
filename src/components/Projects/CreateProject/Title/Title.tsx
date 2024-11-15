import React, { useState } from 'react';
import styles from './Title.module.css';
import { profanity } from '@2toad/profanity';

interface TitleProps {
  title: string;
  setTitle: (value: string) => void;
}

const Title: React.FC<TitleProps> = ({ title, setTitle }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(title.length);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update the title in state immediately
    setTitle(value);

    // Update character count
    setCharCount(value.length);

    // Error handling logic
    if (!value.trim()) {
      setErrorMessage('Project title is required.');
    } else if (profanity.exists(value)) {
      setErrorMessage('Profanity detected in title.');
    } else if (value.length > 40) {
      setErrorMessage('Title cannot exceed 40 characters.');
    } else {
      setErrorMessage(''); // Clear the error if valid
    }
  };

  return (
    <div className={styles.titleContainer}>
      <input
        type="text"
        placeholder="Project Title (max 40 characters)"
        value={title}
        onChange={handleTitleChange}
        className={styles.input}
      />
      <div className={styles.titleInfo}>
        <p className={styles.charCount}>{charCount}/40 characters</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Title;
