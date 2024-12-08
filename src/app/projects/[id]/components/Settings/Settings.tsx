// components/Settings/Settings.tsx

'use client';

import React, { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import AdminAccess from './AdminAccess/AdminAccess';
import DeleteChannel from './RemoveChannels/RemoveChannels';
import RemoveUsers from './RemoveUsers/RemoveUsers';
import ProjectDetails from './ProjectDetails/ProjectDetails';

interface UserAccess {
  adminPrivileges: boolean;
  canRemoveUser: boolean;
  canRemoveChannel: boolean;
  canEditProject: boolean;
  canEditAdminAccess: boolean;
}

interface SettingsProps {
  projectId: string;
  userAccess: UserAccess;
  currentUserId: string;
  userIsOwner: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  projectId,
  userAccess,
  currentUserId,
  userIsOwner,
}) => {
  const [activeTab, setActiveTab] = useState<string>(''); // Start with no active tab

  const {
    adminPrivileges,
    canRemoveUser,
    canRemoveChannel,
    canEditProject,
    canEditAdminAccess,
  } = userAccess;

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  if (!projectId || typeof projectId !== 'string') {
    return <p>Loading...</p>;
  }

  // Determine visibility of tabs based on user access and ownership
  const showEditProject = userIsOwner || adminPrivileges || canEditProject;
  const showRemoveUsers = userIsOwner || adminPrivileges || canRemoveUser;
  const showRemoveChannels = userIsOwner || adminPrivileges || canRemoveChannel;
  const showGrantAdminAccess =
    userIsOwner || adminPrivileges || canEditAdminAccess;

  // Determine the first available tab
  const getFirstAvailableTab = () => {
    if (showEditProject) return 'editProjectDetails';
    if (showRemoveUsers) return 'removeUsers';
    if (showRemoveChannels) return 'removeChannels';
    if (showGrantAdminAccess) return 'grantAdminAccess';
    return '';
  };

  // Set the initial active tab once when the component mounts or userAccess changes
  useEffect(() => {
    if (!activeTab) {
      const firstTab = getFirstAvailableTab();
      if (firstTab) {
        setActiveTab(firstTab);
      }
    }
  }, [activeTab, showEditProject, showRemoveUsers, showRemoveChannels, showGrantAdminAccess]);

  // **Debugging: Log userAccess and showGrantAdminAccess**
  useEffect(() => {
    console.log('User Access:', userAccess);
    console.log('showGrantAdminAccess:', showGrantAdminAccess);
    console.log('Active Tab:', activeTab);
  }, [userAccess, showGrantAdminAccess, activeTab]);

  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.projectHeader}>Project Settings</h2>
      <div className={styles.buttonContainer}>
        {showEditProject && (
          <button
            className={`${styles.button} ${
              activeTab === 'editProjectDetails' ? styles.active : ''
            }`}
            onClick={() => handleTabClick('editProjectDetails')}
          >
            Edit Project Details
          </button>
        )}

        {showRemoveUsers && (
          <button
            className={`${styles.button} ${
              activeTab === 'removeUsers' ? styles.active : ''
            }`}
            onClick={() => handleTabClick('removeUsers')}
          >
            Remove Users
          </button>
        )}

        {showRemoveChannels && (
          <button
            className={`${styles.button} ${
              activeTab === 'removeChannels' ? styles.active : ''
            }`}
            onClick={() => handleTabClick('removeChannels')}
          >
            Remove Channels
          </button>
        )}

        {showGrantAdminAccess && (
          <button
            className={`${styles.button} ${
              activeTab === 'grantAdminAccess' ? styles.active : ''
            }`}
            onClick={() => handleTabClick('grantAdminAccess')}
          >
            Grant Admin Access
          </button>
        )}
      </div>

      <div className={styles.contentContainer}>
        {activeTab === 'editProjectDetails' && showEditProject && (
          <div>
            <h3>Edit Project Details</h3>
            <ProjectDetails projectId={projectId} />
            {/* Add form elements for editing project details */}
          </div>
        )}

        {activeTab === 'removeUsers' && showRemoveUsers && (
          <div>
            <h3>Remove Users</h3>
            <RemoveUsers
              projectId={projectId}
              currentUserId={currentUserId}
              userIsOwner={userIsOwner}
              canRemoveUser={canRemoveUser}
            />
          </div>
        )}

        {activeTab === 'removeChannels' && showRemoveChannels && (
          <div>
            <h3>Remove Channels</h3>
            <DeleteChannel projectId={projectId} />
          </div>
        )}

        {activeTab === 'grantAdminAccess' && showGrantAdminAccess && (
          <div>
            <h3>Grant Admin Access</h3>
            <AdminAccess projectId={projectId}  />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
