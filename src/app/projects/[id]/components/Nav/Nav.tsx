import React from 'react';
import styles from './Nav.module.css';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'messaging' | 'settings') => void;
}

const Nav: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'messaging' ? styles.active : ''}`}
          onClick={() => setActiveTab('messaging')}
        >
          Messaging
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default Nav;
