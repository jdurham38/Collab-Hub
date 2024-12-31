import React, { useState } from 'react';
import styles from './index.module.css'; 
import { profanity } from '@2toad/profanity';

interface EditTitleProps {
  title: string;
  setTitle: (title: string) => void;
}

const EditTitle: React.FC<EditTitleProps> = ({ title, setTitle }) => {
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
    <div className={styles.editTitleContainer}>
      <label htmlFor="title" className={styles.label}>
        <h2><b>Edit Title:</b></h2>
      </label>
      <input
        type="text"
        id="title"
        placeholder="Project Title (max 40 characters)"
        value={title}
        onChange={handleTitleChange}
        className={styles.input}
        maxLength={40}
        required
      />
      <div className={styles.titleInfo}>
        <p className={styles.charCount}>{charCount}/40 characters</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default EditTitle;
