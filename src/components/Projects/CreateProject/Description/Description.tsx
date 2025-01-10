'use client';
import React from 'react';
import styles from './Description.module.css';
import dynamic from 'next/dynamic';

const ReactQuillWrapper = dynamic(() => import('@/utils/ReactQuillWrapper'), {
  ssr: false,
});

interface DescriptionProps {
  description: string;
  setDescription: (value: string) => void;
}

const Description: React.FC<DescriptionProps> = ({
  description,
  setDescription,
}) => {
  return (
    <>
      <div className={styles.richTextEditor}>
        <ReactQuillWrapper
          value={description}
          onChange={setDescription}
          placeholder="Project Description (max 200 characters)"
        />
      </div>
    </>
  );
};

export default Description;
