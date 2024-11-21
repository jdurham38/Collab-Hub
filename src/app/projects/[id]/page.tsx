"use client";

import React, { useEffect, useState } from 'react';
import Settings from './components/Settings/Settings';
import ProjectMessaging from './components/Messaging/Messaging'
import Overview from './components/ProjectDetails/Overview';
import Nav from './components/Nav/Nav';
import styles from './ProjectPage.module.css';
import ProjectBanner from './components/ProjectDetails/Banner/Banner';
import { Project } from '@/utils/interfaces';
import {  getBanner } from '@/services/IndividualProjects/overview';
interface ProjectPageProps {
  params: { id: string };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { id: projectId } = params;
    const [project, setProject] = useState<Project | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'messaging' | 'settings'>(
    'overview'
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBannerUrl = async () => {
      try {
        const projectData = await getBanner(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching banner url:', err);
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBannerUrl();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;

  return (
    <div className={styles.projectPage}>
      <ProjectBanner bannerUrl={project.banner_url} title={project.title} />

      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.tabContent}>
        {activeTab === 'overview' && <Overview projectId={projectId} />}
        {activeTab === 'messaging' && <ProjectMessaging />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default ProjectPage;

