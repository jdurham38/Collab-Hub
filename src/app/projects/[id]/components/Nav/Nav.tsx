// File: /components/Nav/Nav.tsx

"use client";

import React from 'react';
import styles from './Nav.module.css';

// Define the possible tab names using a TypeScript union type
type TabName = 'overview' | 'messaging' | 'settings';

// Update the NavProps interface to include availableTabs
interface NavProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  availableTabs: TabName[]; // New prop to specify which tabs to display
}

const Nav: React.FC<NavProps> = ({ activeTab, setActiveTab, availableTabs }) => {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabButtons}>
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {/* Capitalize the first letter of the tab name */}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Nav;
