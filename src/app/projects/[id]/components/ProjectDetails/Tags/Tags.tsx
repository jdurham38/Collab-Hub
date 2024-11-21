import React from 'react';
import styles from './Tags.module.css';

interface ProjectTagsProps {
  tags: string[];
}

const ProjectTags: React.FC<ProjectTagsProps> = ({ tags }) => (
  <div className={styles.tagsContainer}>
    <h2>Project Tags:</h2>
    <div className={styles.tagsList}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default ProjectTags;
