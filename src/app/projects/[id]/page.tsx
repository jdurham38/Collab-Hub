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
    canRemoveUser,
    canRemoveChannel,
    canEditProject,
    canEditAdminAccess,
    loading: userLoading,
    error: userError,
  } = useUserData(projectId);

  const [activeTab, setActiveTab] = useState<'overview' | 'messaging' | 'settings'>('overview');

  const loading = projectLoading || userLoading;
  const error = projectError || userError;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;
  if (!currentUser) return <div>Please log in to view this project.</div>;

  // Determine which tabs are available.
  // 'overview' and 'messaging' are always available to logged-in users.
  // 'settings' is available if user has any admin or edit privileges (checked in Settings).
  const tabs: Array<'overview' | 'messaging' | 'settings'> = ['overview', 'messaging'];

  // We'll rely on the Settings component itself to handle visibility of its internal tabs.
  // But we only show the "settings" tab if the user has any privileges that warrant showing settings
  const hasAnySettingsPrivilege = adminPrivileges || canRemoveUser || canRemoveChannel || canEditProject || canEditAdminAccess;
  if (hasAnySettingsPrivilege) {
    tabs.push('settings');
  }

  // Compute userIsOwner
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
        {activeTab === 'overview' && <Overview projectId={projectId} />}
        {activeTab === 'messaging' && (
          <ProjectMessaging projectId={projectId} currentUser={currentUser} />
        )}
        {activeTab === 'settings' && hasAnySettingsPrivilege && (
          <Settings
            projectId={projectId}
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
