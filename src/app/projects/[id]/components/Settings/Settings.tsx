// components/Settings.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './Settings.module.css';
import GrantAdminForm from './AdminAccess/AdminAccess';

interface SettingsProps{
 projectId: string}


const Settings: React.FC<SettingsProps>  = ({projectId}) => {
  const [activeTab, setActiveTab] = useState<string>('editProjectDetails');

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Handle the case where projectId is not yet available
  if (!projectId || typeof projectId !== 'string') {
    return <p>Loading...</p>; // You can replace this with a better loading indicator
  }

  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.projectHeader}>Project Settings</h2>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${
            activeTab === 'editProjectDetails' ? styles.active : ''
          }`}
          onClick={() => handleTabClick('editProjectDetails')}
        >
          Edit Project Details
        </button>
        <button
          className={`${styles.button} ${
            activeTab === 'removeUsers' ? styles.active : ''
          }`}
          onClick={() => handleTabClick('removeUsers')}
        >
          Remove Users
        </button>
        <button
          className={`${styles.button} ${
            activeTab === 'removeChannels' ? styles.active : ''
          }`}
          onClick={() => handleTabClick('removeChannels')}
        >
          Remove Channels
        </button>
        <button
          className={`${styles.button} ${
            activeTab === 'grantAdminAccess' ? styles.active : ''
          }`}
          onClick={() => handleTabClick('grantAdminAccess')}
        >
          Grant Admin Access
        </button>
      </div>

      {/* Conditional rendering based on the active tab */}
      <div className={styles.contentContainer}>
        {activeTab === 'editProjectDetails' && (
          <div>
            <h3>Edit Project Details</h3>
            <p>Preview Mode: Content for editing project details.</p>
            {/* Add form elements for editing project details */}
          </div>
        )}
        {activeTab === 'removeUsers' && (
          <div>
            <h3>Remove Users</h3>
            <p>Preview Mode: Content for removing users.</p>
            {/* Add elements for removing users */}
          </div>
        )}
        {activeTab === 'removeChannels' && (
          <div>
            <h3>Remove Channels Content</h3>
            <p>Preview Mode: Content for removing the channels.</p>
            <p>
              Note: Upon removing any channels, all messages will be permanently deleted.
            </p>

            {/* Add controls for enabling/disabling channels */}
          </div>
        )}
        {activeTab === 'grantAdminAccess' && (
          <div>
            <h3>Grant Admin Access</h3>
            <GrantAdminForm projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
