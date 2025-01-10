import React from 'react';
import { Project } from '@/utils/interfaces';
import styles from './PreviewProjectModal.module.css';
import DOMPurify from 'dompurify';

interface ProjectPreviewProps {
  project: Project;
  onClose: () => void;
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  project,
  onClose,
}) => {
  const sanitizedDescription = DOMPurify.sanitize(project.description);

  return (
    <div className={styles.overlay}>
      <div className={styles.previewContent}>
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>
        <h2 className={styles.title}>{project.title}</h2>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
        <h3 className={styles.subtitle}>Roles</h3>
        <div className={styles.tags}>
          {project.roles.map((role) => (
            <span key={role} className={styles.tag}>
              {role}
            </span>
          ))}
        </div>
        <h3 className={styles.subtitle}>Tags</h3>
        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;
