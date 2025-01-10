'use client';

import React, { useState } from 'react';
import Settings from './components/Settings/Settings';
import ProjectMessaging from './components/Messaging/Messaging';
import Overview from './components/ProjectDetails/Overview';
import Nav from './components/Nav/Nav';
import styles from './ProjectPage.module.css';
import ProjectBanner from './components/ProjectDetails/Banner/Banner';
import useProjectData from '@/hooks/individualProjects/useProjectData';
import useUserData from '@/hooks/individualProjects/useUserData';
import { useParams } from 'next/navigation'


const ProjectPage: React.FC = () => {
    const params = useParams()
    const projectId = params?.id; // Use the optional chaining here

    const {
      project,
      loading: projectLoading,
      error: projectError,
    } = useProjectData(projectId as string);

  const {
    currentUser,
    adminPrivileges,
    canRemoveUser,
    canRemoveChannel,
    canEditProject,
    canEditAdminAccess,
    loading: userLoading,
    error: userError,
  } = useUserData(projectId as string);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'messaging' | 'settings'
  >('overview');

  const loading = projectLoading || userLoading;
  const error = projectError || userError;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;
  if (!currentUser) return <div>Please log in to view this project.</div>;

  const tabs: Array<'overview' | 'messaging' | 'settings'> = [
    'overview',
    'messaging',
  ];

  const hasAnySettingsPrivilege =
    adminPrivileges ||
    canRemoveUser ||
    canRemoveChannel ||
    canEditProject ||
    canEditAdminAccess;
  if (hasAnySettingsPrivilege) {
    tabs.push('settings');
  }

  const userIsOwner = project.created_by === currentUser.id;

  return (
    <div className={styles.projectPage}>
      <ProjectBanner bannerUrl={project.banner_url} title={project.title} />

      <Nav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableTabs={tabs}
      />

      <div className={styles.tabContent}>
        {activeTab === 'overview' && <Overview projectId={projectId as string} />}
        {activeTab === 'messaging' && (
          <ProjectMessaging projectId={projectId as string} currentUser={currentUser} />
        )}
        {activeTab === 'settings' && hasAnySettingsPrivilege && (
          <Settings
            projectId={projectId as string}
            userAccess={{
              adminPrivileges,
              canRemoveUser,
              canRemoveChannel,
              canEditProject,
              canEditAdminAccess,
            }}
            currentUserId={currentUser.id}
            userIsOwner={userIsOwner}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
