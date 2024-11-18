import React from 'react';
import styles from './PreviewDescription.module.css';

interface PreviewDescriptionProps {
  description: string;
}

const PreviewDescription: React.FC<PreviewDescriptionProps> = ({ description }) => (
  <div className={styles.descriptionContainer}>
    <h2>Project Description:</h2>
    <p
      className={styles.descriptionText}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  </div>
);

export default PreviewDescription;
