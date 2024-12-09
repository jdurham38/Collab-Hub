// components/ReactQuillWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { profanity } from '@2toad/profanity';
import { useState, useEffect } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface ReactQuillWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const ReactQuillWrapper: React.FC<ReactQuillWrapperProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const updatePlainTextAndCharCount = () => {
      const text = getPlainText(value);
      setCharCount(text.length);
    };
    updatePlainTextAndCharCount();
  }, [value]);

  const getPlainText = (html: string) => {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }
    return '';
  };

  const handleDescriptionChange = (newValue: string) => {
    const text = getPlainText(newValue);

    if (profanity.exists(text)) {
      setErrorMessage('Profanity detected in description.');
    } else if (text.length > 200) {
      setErrorMessage('Description cannot exceed 200 characters.');
    } else {
      setErrorMessage('');
      onChange(newValue); // Call the onChange prop
      setCharCount(text.length);
    }
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <ReactQuill
          value={value}
          onChange={handleDescriptionChange}
          placeholder={placeholder}
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
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            right: '0',
            fontSize: '0.8rem',
            color: charCount > 200 ? 'red' : 'inherit',
          }}
        >
          {charCount}/200 characters
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      </div>
    </>
  );
};

export default ReactQuillWrapper;