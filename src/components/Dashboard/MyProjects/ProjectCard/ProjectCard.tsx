

'use client';

import React from 'react';
import styles from './ProjectCard.module.css';
import Link from 'next/link';


interface ProjectCardProject {
    id: string;
    banner_url: string;
    title: string;
    createdAt: string;
     created_by_username: string;
  }
interface ProjectCardProps {
  project: ProjectCardProject
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const { id, banner_url, title, createdAt, created_by_username } = project;
  return (
    <div className={styles.projectCard}>
      <div className={styles.bannerContainer}>
        {banner_url ? <img src={banner_url} alt="Project Banner" className={styles.bannerImage} /> : <div className={styles.noBanner}>No Banner</div>}
      </div>
      <div className={styles.projectInfo}>
      <Link href={`/projects/${id}`}>
        <h2 className={styles.title}>{title}</h2>
        </Link>
          <p className={styles.createdDate}>
             Created By: {created_by_username}
        </p>
        <p className={styles.createdDate}>
          Created at: {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;