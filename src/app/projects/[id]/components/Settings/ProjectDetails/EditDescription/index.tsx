'use client';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { profanity } from '@2toad/profanity';

interface EditDescriptionProps {
  description: string;
  setDescription: (value: string) => void;
}

const EditDescription: React.FC<EditDescriptionProps> = ({
  description,
  setDescription,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [, setPlainText] = useState('');


  useEffect(() => {
    const updatePlainTextAndCharCount = () => {
        const text = getPlainText(description)
        setPlainText(text);
        setCharCount(text.length);
    }
    updatePlainTextAndCharCount();
}, [description]);

  const getPlainText = (html: string) => {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }
    return '';
  };

  const handleDescriptionChange = (value: string) => {
    const text = getPlainText(value);


    if (profanity.exists(text)) {
      setErrorMessage('Profanity detected in description.');
    } else if (text.length > 200) {
      setErrorMessage('Description cannot exceed 200 characters.');
    } else {
      setErrorMessage('');
      setDescription(value);
      setCharCount(text.length); // Update charCount if valid
      setPlainText(text) // Update plainText if valid
    }


  };

  return (
    <>
      <div className={styles.richTextEditor}>
        <ReactQuill
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Project Description (max 200 characters)"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
            ],
          }}
          formats={[
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'list',
            'link',
            'image',
          ]}
        />
      </div>
      <div className={styles.descriptionInfo}>
        <p
          className={`${styles.charCount} ${
            charCount > 200 ? styles.charCountError : ''
          }`}
        >
          {charCount}/200 characters
        </p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </>
  );
};

export default EditDescription;