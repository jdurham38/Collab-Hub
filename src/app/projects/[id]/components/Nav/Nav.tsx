'use client';

import React from 'react';
import styles from './Nav.module.css';

type TabName = 'overview' | 'messaging' | 'settings';

interface NavProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  availableTabs: TabName[];
}

const Nav: React.FC<NavProps> = ({
  activeTab,
  setActiveTab,
  availableTabs,
}) => {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabButtons}>
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Nav;
