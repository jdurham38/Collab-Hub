'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>(''); 

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

   
  const showEditProject = useMemo(() => userIsOwner || adminPrivileges || canEditProject, [userIsOwner, adminPrivileges, canEditProject]);
  const showRemoveUsers = useMemo(() => userIsOwner || adminPrivileges || canRemoveUser, [userIsOwner, adminPrivileges, canRemoveUser]);
  const showRemoveChannels = useMemo(() => userIsOwner || adminPrivileges || canRemoveChannel, [userIsOwner, adminPrivileges, canRemoveChannel]);
  const showGrantAdminAccess = useMemo(() => userIsOwner || adminPrivileges || canEditAdminAccess, [userIsOwner, adminPrivileges, canEditAdminAccess]);

  const getFirstAvailableTab = () => {
    if (showEditProject) return 'editProjectDetails';
    if (showRemoveUsers) return 'removeUsers';
    if (showRemoveChannels) return 'removeChannels';
    if (showGrantAdminAccess) return 'grantAdminAccess';
    return '';
  };


    
  useEffect(() => {
    if (!activeTab) {
      const firstTab = getFirstAvailableTab();
      if (firstTab) {
        setActiveTab(firstTab);
      }
    }
  }, [activeTab, getFirstAvailableTab]); 



    
    if (!projectId || typeof projectId !== 'string') {
      return <p>Loading...</p>;
    }

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
            <ProjectDetails projectId={projectId} />
            {}
          </div>
        )}

        {activeTab === 'removeUsers' && showRemoveUsers && (
          <div>
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
            <DeleteChannel projectId={projectId} />
          </div>
        )}

        {activeTab === 'grantAdminAccess' && showGrantAdminAccess && (
          <div>
            <AdminAccess projectId={projectId}  />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;