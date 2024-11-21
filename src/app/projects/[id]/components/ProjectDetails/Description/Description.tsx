import React from 'react';
import styles from './Description.module.css';

interface ProjectDescriptionProps {
  description: string;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ description }) => (
  <div className={styles.descriptionContainer}>
    <h2>Project Description:</h2>
    <p
      className={styles.descriptionText}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  </div>
);

export default ProjectDescription;
