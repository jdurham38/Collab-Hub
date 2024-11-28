

import React, { useState } from 'react';
import styles from './Description.module.css';


import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';


import { profanity } from '@2toad/profanity';

interface DescriptionProps {
  description: string;
  setDescription: (value: string) => void;
}

const Description: React.FC<DescriptionProps> = ({ description, setDescription }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  
  const getPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleDescriptionChange = (value: string) => {
    
    const plainText = getPlainText(value);

    
    setCharCount(plainText.length);

    
    if (profanity.exists(plainText)) {
      setErrorMessage('Profanity detected in description.');
    } else if (plainText.length > 200) {
      setErrorMessage('Description cannot exceed 200 characters.');
    } else {
      setErrorMessage('');
    }

    
    if (plainText.length <= 200) {
      setDescription(value);
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
          <p className={styles.charCount}>{charCount}/200 characters</p>
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        </div>
    </>
  );
};

export default Description;
