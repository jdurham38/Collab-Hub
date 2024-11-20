import React, { useEffect, useState } from 'react';
import { getProjectOverview } from '@/services/IndividualProjects/overview';
import styles from './Overview.module.css';
import Image from 'next/image';

interface OverviewProps {
  projectId: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  banner_url: string;
  tags: string[];
  roles: string[];
}

const Overview: React.FC<OverviewProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectOverview = async () => {
      try {
        const projectData = await getProjectOverview(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project overview:', err);
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjectOverview();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;

  return (
    <div className={styles.overviewContainer}>
      <h1 className={styles.title}>{project.title}</h1>
      <Image
        src={project.banner_url}
        alt={project.title}
        className={styles.bannerImage}
        width={100}
        height={100}
      />
      <p className={styles.description}>{project.description}</p>
      <h3>Tags</h3>
      <ul className={styles.list}>
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <h3>Roles</h3>
      <ul className={styles.list}>
        {project.roles.map((role) => (
          <li key={role}>{role}</li>
        ))}
      </ul>
    </div>
  );
};

export default Overview;
