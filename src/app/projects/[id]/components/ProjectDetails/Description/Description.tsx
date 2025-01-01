import React from 'react';
import styles from './Description.module.css';
import DOMPurify from 'dompurify';

interface ProjectDescriptionProps {
  description: string;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ description }) => {
    const sanitizedDescription = DOMPurify.sanitize(description);

    return(
        <div className={styles.descriptionContainer}>
            <h2>Project Description:</h2>
            <div
                className={styles.descriptionText}
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
        </div>
    )
};

export default ProjectDescription;