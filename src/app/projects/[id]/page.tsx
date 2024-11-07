"use client";

import { useEffect, useState } from 'react';
import styles from './project.module.css';

interface Project {
  title: string;
  created_by: string;
}

const ProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!project) return <div>Project not found.</div>;

  return (
    <div className={styles.projectContainer}>
      <h1 className={styles.title}>{project.title}</h1>
      <p className={styles.creator}>Created by: {project.created_by}</p>
    </div>
  );
};

export default ProjectPage;
