import React from 'react';
import { Project } from '@/utils/interfaces';
import styles from './ProjectCard.module.css'; // Import CSS module

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className={styles.card}>
      <img src={project.banner_url} alt={project.title} className={styles.banner} />
      <div className={styles.info}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.tags}>
          {project.roles.map((role) => (
            <span key={role} className={styles.tag}>
              {role}
            </span>
          ))}
        </div>
        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <p className={styles.createdBy}>
          Created by: {project.created_by_username}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;