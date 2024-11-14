import React from 'react';
import styles from './PreviewMessaging.module.css';

const PreviewMessaging: React.FC = () => {
  return (
    <div className={styles.messagingContainer}>
      <h2>Messaging</h2>
      <p>Global Group Messaging - Includes all project members</p>
      <p>Channel Messaging - For specific topics</p>
      <p>Individual Messaging - Direct messages between members</p>
      <p>Note: Messages will auto-delete after 14 days.</p>
      {/* Add additional layout and functionality for messaging channels here */}
    </div>
  );
};

export default PreviewMessaging;
