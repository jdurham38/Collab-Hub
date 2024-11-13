// Description.tsx

import React, { useState } from 'react';
import styles from './Description.module.css';

// Dynamically import ReactQuill to prevent SSR issues
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Import the profanity checker
import { profanity } from '@2toad/profanity';

interface DescriptionProps {
  description: string;
  setDescription: (value: string) => void;
}

const Description: React.FC<DescriptionProps> = ({ description, setDescription }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Function to strip HTML tags and get plain text
  const getPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleDescriptionChange = (value: string) => {
    // Get plain text from HTML content
    const plainText = getPlainText(value);

    // Update character count
    setCharCount(plainText.length);

    // Check for profanity
    if (profanity.exists(plainText)) {
      setErrorMessage('Profanity detected in description.');
    } else if (plainText.length > 200) {
      setErrorMessage('Description cannot exceed 200 characters.');
    } else {
      setErrorMessage('');
    }

    // Limit description to 200 characters
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
