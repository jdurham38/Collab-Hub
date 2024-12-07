'use client';

import React, { useState } from 'react';
import styles from './Settings.module.css';
import AdminAccess from './AdminAccess/AdminAccess';
import DeleteChannel from './RemoveChannels/RemoveChannels';
import RemoveUsers from './RemoveUsers/RemoveUsers';

interface UserAccess {
  adminPrivileges: boolean;
  canRemoveUser: boolean;
  canRemoveChannel: boolean;
  canEditProject: boolean;
}

interface SettingsProps {
  projectId: string;
  userAccess: UserAccess;
  currentUserId: string;
  userIsOwner: boolean;
}

const Settings: React.FC<SettingsProps> = ({ projectId, userAccess, currentUserId, userIsOwner }) => {
  const [activeTab, setActiveTab] = useState<string>(''); // Start with no active tab

  const { adminPrivileges, canRemoveUser, canRemoveChannel, canEditProject } = userAccess;

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  if (!projectId || typeof projectId !== 'string') {
    return <p>Loading...</p>;
  }

  // If user is owner, show all tabs. Otherwise, fallback to privileges logic.
  let showEditProject = userIsOwner || adminPrivileges || canEditProject;
  let showRemoveUsers = userIsOwner || adminPrivileges || canRemoveUser;
  let showRemoveChannels = userIsOwner || adminPrivileges || canRemoveChannel;
  let showGrantAdminAccess = userIsOwner || adminPrivileges;

  // If there's no active tab yet, pick the first available one
  let firstAvailableTab = '';
  if (showEditProject) firstAvailableTab = 'editProjectDetails';
  else if (showRemoveUsers) firstAvailableTab = 'removeUsers';
  else if (showRemoveChannels) firstAvailableTab = 'removeChannels';
  else if (showGrantAdminAccess) firstAvailableTab = 'grantAdminAccess';

  if (!activeTab && firstAvailableTab) {
    setActiveTab(firstAvailableTab);
  }

  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.projectHeader}>Project Settings</h2>
      <div className={styles.buttonContainer}>
        {showEditProject && (
          <button
            className={`${styles.button} ${activeTab === 'editProjectDetails' ? styles.active : ''}`}
            onClick={() => handleTabClick('editProjectDetails')}
          >
            Edit Project Details
          </button>
        )}

        {showRemoveUsers && (
          <button
            className={`${styles.button} ${activeTab === 'removeUsers' ? styles.active : ''}`}
            onClick={() => handleTabClick('removeUsers')}
          >
            Remove Users
          </button>
        )}

        {showRemoveChannels && (
          <button
            className={`${styles.button} ${activeTab === 'removeChannels' ? styles.active : ''}`}
            onClick={() => handleTabClick('removeChannels')}
          >
            Remove Channels
          </button>
        )}

        {showGrantAdminAccess && (
          <button
            className={`${styles.button} ${activeTab === 'grantAdminAccess' ? styles.active : ''}`}
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
            <p>Preview Mode: Content for editing project details.</p>
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
            <AdminAccess projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
