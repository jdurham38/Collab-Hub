
"use client";
import React, { useState, useEffect } from 'react';
import styles from './BioInput.module.css'; 

interface BioInputProps {
  value: string | null;
  onChange: (value: string) => void;
}

const BioInput: React.FC<BioInputProps> = ({ value, onChange }) => {
  const [bioLength, setBioLength] = useState<number>(value ? value.length : 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBioLength(value ? value.length : 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setBioLength(newValue.length);
    if (newValue.length > 100) {
      setError('Bio must not exceed 100 characters.');
    } else {
      setError(null);
    }
    onChange(newValue);
  };

  return (
    <div className={styles.inputContainer}>
      <label className={styles.label} htmlFor="bio">
        Bio
      </label>
      <textarea
        id="bio"
        name="bio"
        className={`${styles.textarea} ${error ? styles.error : ''}`}
        placeholder="Detailed bio"
        value={value || ''}
        onChange={handleChange}
      />
      <p className={styles.characterCount}>{bioLength}/100 characters</p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default BioInput;