import React from 'react';
import styles from './PreviewDescription.module.css';
import DOMPurify from 'dompurify';

interface PreviewDescriptionProps {
  description: string;
}

const PreviewDescription: React.FC<PreviewDescriptionProps> = ({
  description,
}) => {
  const sanitizedDescription = DOMPurify.sanitize(description);

  return (
    <div className={styles.descriptionContainer}>
      <h2>Project Description:</h2>
      <div
        className={styles.descriptionText}
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />
    </div>
  );
};

export default PreviewDescription;
