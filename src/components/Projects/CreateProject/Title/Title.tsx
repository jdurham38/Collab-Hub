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
    let value = e.target.value;

    if (value.length > 40) {
      value = value.slice(0, 40);
    }

    setTitle(value);

    setCharCount(value.length);

    if (!value.trim()) {
      setErrorMessage('Project title is required.');
    } else if (profanity.exists(value)) {
      setErrorMessage('Profanity detected in title.');
    } else {
      setErrorMessage('');
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
        maxLength={40}
      />
      <div className={styles.titleInfo}>
        <p className={styles.charCount}>{charCount}/40 characters</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Title;
