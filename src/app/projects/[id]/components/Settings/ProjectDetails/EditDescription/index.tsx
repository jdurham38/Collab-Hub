// components/EditDescription.tsx (or wherever your EditDescription component is)
'use client';
import React from 'react';
import styles from './index.module.css';
import dynamic from 'next/dynamic';

const ReactQuillWrapper = dynamic(
  () => import('@/utils/ReactQuillWrapper'),
  { ssr: false }
);

interface EditDescriptionProps {
  description: string;
  setDescription: (value: string) => void;
}

const EditDescription: React.FC<EditDescriptionProps> = ({
  description,
  setDescription,
}) => {
  return (
    <>
      <h2><b>Edit Description:</b></h2>
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

export default EditDescription;