
"use client";
import React, { useState, useEffect } from 'react';
import styles from './ShortBioInput.module.css'; 

interface ShortBioInputProps {
  value: string | null;
  onChange: (value: string) => void;
}

const ShortBioInput: React.FC<ShortBioInputProps> = ({ value, onChange }) => {
  const [shortBioLength, setShortBioLength] = useState<number>(value ? value.length : 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShortBioLength(value ? value.length : 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setShortBioLength(newValue.length);
    if (newValue.length > 35) {
      setError('Short bio must not exceed 35 characters.');
    } else {
      setError(null);
    }
    onChange(newValue);
  };

  return (
    <div className={styles.inputContainer}>
      <label className={styles.label} htmlFor="bio">
        Short Bio
      </label>
      <input
        id="bio"
        name="shortBio"
        className={`${styles.input} ${error ? styles.error : ''}`}
        placeholder="A little sentence about you!"
        value={value || ''}
        onChange={handleChange}
      />
      <p className={styles.characterCount}>{shortBioLength}/35 characters</p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ShortBioInput;