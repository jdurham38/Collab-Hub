'use client';

import React from 'react';
import styles from './ProjectCard.module.css';
import Link from 'next/link';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import Image from 'next/image';
interface ProjectCardProject {
  id: string;
  banner_url: string;
  title: string;
  createdAt: string;
  created_by: string;
  created_by_username: string;
}

interface ProjectCardProps {
  project: ProjectCardProject;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { id, banner_url, title, createdAt, created_by_username, created_by } =
    project;
  const user = useAuthRedirect();
  const isProjectOwner = user?.id === created_by;

  const createdByDisplay = isProjectOwner ? 'You' : created_by_username;

  return (
    <div className={styles.projectCard}>
      <div className={styles.bannerContainer}>
        {banner_url ? (
          <Image
            src={banner_url}
            alt="Project Banner"
            className={styles.bannerImage}
            width={100}
            height={100}
          />
        ) : (
          <div className={styles.noBanner}>No Banner</div>
        )}
      </div>
      <div className={styles.projectInfo}>
        <Link href={`/projects/${id}`}>
          <h2 className={styles.title}>{title}</h2>
        </Link>
        <p className={styles.createdDate}>Created By: {createdByDisplay}</p>
        <p className={styles.createdDate}>
          Created at: {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;
