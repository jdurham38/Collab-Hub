'use client';

import React, { useState } from 'react';
import Settings from './components/Settings/Settings';
import ProjectMessaging from './components/Messaging/Messaging';
import Overview from './components/ProjectDetails/Overview';
import Nav from './components/Nav/Nav';
import styles from './ProjectPage.module.css';
import ProjectBanner from './components/ProjectDetails/Banner/Banner';
import useProjectData from '@/hooks/individualProjects/useProjectData'; // Adjust the path as necessary
import useUserData from '@/hooks/individualProjects/useUserData'; // Adjust the path as necessary

interface ProjectPageProps {
  params: { id: string };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { id: projectId } = params;

  // Use Custom Hooks
  const {
    project,
    loading: projectLoading,
    error: projectError,
  } = useProjectData(projectId);

  const {
    currentUser,
    adminPrivileges,
    loading: userLoading,
    error: userError,
  } = useUserData(projectId);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'messaging' | 'settings'
  >('overview');

  const loading = projectLoading || userLoading;
  const error = projectError || userError;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;
  if (!currentUser) return <div>Please log in to view this project.</div>;

  // Define Tabs Based on Privileges
  const tabs: Array<'overview' | 'messaging' | 'settings'> = [
    'overview',
    'messaging',
  ];
  if (adminPrivileges) {
    tabs.push('settings');
  }

  return (
    <div className={styles.projectPage}>
      <ProjectBanner bannerUrl={project.banner_url} title={project.title} />

      <Nav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableTabs={tabs}
      />

      <div className={styles.tabContent}>
        {activeTab === 'overview' && <Overview projectId={projectId} />}
        {activeTab === 'messaging' && (
          <ProjectMessaging projectId={projectId} currentUser={currentUser} />
        )}
        {activeTab === 'settings' && adminPrivileges && (
          <Settings projectId={projectId} />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
