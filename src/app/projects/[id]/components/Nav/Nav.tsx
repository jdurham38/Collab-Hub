'use client';

import React, { memo, useCallback } from 'react';
import styles from './Nav.module.css';

type TabName = 'overview' | 'messaging' | 'settings';

interface NavProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  availableTabs: TabName[];
}

const Nav: React.FC<NavProps> = memo(({
  activeTab,
  setActiveTab,
  availableTabs,
}) => {
    const handleTabClick = useCallback((tab: TabName) => {
      setActiveTab(tab)
    }, [setActiveTab]);

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabButtons}>
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
});

export default Nav;