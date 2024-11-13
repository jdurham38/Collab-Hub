import React from 'react';
import styles from './PreviewTags.module.css';

interface PreviewTagsProps {
  tags: string[];
}

const PreviewTags: React.FC<PreviewTagsProps> = ({ tags }) => (
  <div className={styles.tagsContainer}>
    <h2>Tags</h2>
    <div className={styles.tagsList}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default PreviewTags;
