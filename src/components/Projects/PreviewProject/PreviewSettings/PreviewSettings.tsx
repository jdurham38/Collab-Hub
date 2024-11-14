import React from 'react';
import styles from './PreviewSettings.module.css';

const PreviewSettings: React.FC = () => {
  return (
    <div className={styles.settingsContainer}>
      <h2>Project Settings</h2>
      <button className={styles.settingsButton}>Edit Project Details</button>
      <button className={styles.settingsButton}>Remove Users</button>
      <button className={styles.settingsButton}>Enable/Disable Tabs</button>
      <button className={styles.settingsButton}>Grant Admin Access</button>
      {/* Add form elements and controls for project settings here */}
    </div>
  );
};

export default PreviewSettings;
