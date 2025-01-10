
"use client";
import React, { useState, useEffect } from 'react';
import styles from './UrlInput.module.css';
import { isValidUrl, formatUrl } from '@/utils/linkChecker';

interface UrlInputProps {
  name: string;
  value: string | null;
  placeholder: string;
  onChange: (value: string) => void;
  Icon?: React.ReactNode;
}

const UrlInput: React.FC<UrlInputProps> = ({
  name,
  value,
  placeholder,
  onChange,
  Icon,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value && formatUrl(value) && !isValidUrl(value)) {
      setError('Please enter a valid URL.');
    } else {
      setError(null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue && formatUrl(newValue) && !isValidUrl(newValue)) {
      setError('Please enter a valid URL.');
    } else {
      setError(null);
    }
    onChange(newValue);
  };

  return (
    <div className={styles.inputContainer}>
      {Icon && <div className={styles.icon}> {Icon} </div>}
      <input
        type="text"
        id={name}
        name={name}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ''}`}
        value={value || ''}
        onChange={handleChange}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default UrlInput;