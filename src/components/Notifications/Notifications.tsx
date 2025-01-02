import React from 'react';
import SideNav from './SideNav/SideNav';
import styles from './Notification.module.css';
const Notifications: React.FC = ( ) => {

  return (
    <div className={styles.container}>
        <SideNav />
    </div>
  );
};

export default Notifications;
