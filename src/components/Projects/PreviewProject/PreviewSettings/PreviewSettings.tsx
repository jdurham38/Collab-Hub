import React, { useState } from 'react';
import styles from './PreviewSettings.module.css';

const PreviewSettings: React.FC = () => {
  
  const [activeTab, setActiveTab] = useState<string>('editProjectDetails');

  
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.projectHeader}>Project Settings</h2>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${activeTab === 'editProjectDetails' ? styles.active : ''}`}
          onClick={() => handleTabClick('editProjectDetails')}
        >
          Edit Project Details
        </button>
        <button
          className={`${styles.button} ${activeTab === 'removeUsers' ? styles.active : ''}`}
          onClick={() => handleTabClick('removeUsers')}
        >
          Remove Users
        </button>
        <button
          className={`${styles.button} ${activeTab === 'enableDisableTabs' ? styles.active : ''}`}
          onClick={() => handleTabClick('enableDisableTabs')}
        >
          Enable/Disable Tabs
        </button>
        <button
          className={`${styles.button} ${activeTab === 'grantAdminAccess' ? styles.active : ''}`}
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
        {activeTab === 'enableDisableTabs' && (
          <div>
            <h3>Enable/Disable Content</h3>
            <p>Preview Mode: Content for enabling/disabling the project managemer and workspace.</p>
            <p>Note: upon disabling any active content this content will be permanently deleted.</p>

            {/* Add controls for enabling/disabling tabs */}
          </div>
        )}
        {activeTab === 'grantAdminAccess' && (
          <div>
            <h3>Administrator</h3>
            <p>Preview Mode: Content for granting admin access to enable project collaborators to have custom privledges.</p>
            {/* Add elements for granting admin access */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSettings;
