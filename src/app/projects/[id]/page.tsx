"use client";

import React, { useState } from 'react';
import Settings from './components/Settings/Settings';
import Messaging from './components/Messaging/Messaging';
import Overview from './components/ProjectDetails/Overview';
import Nav from './components/Nav/Nav';
import styles from './ProjectPage.module.css';

interface ProjectPageProps {
  params: { id: string };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { id: projectId } = params;
  const [activeTab, setActiveTab] = useState<'overview' | 'messaging' | 'settings'>(
    'overview'
  );

  return (
    <div className={styles.projectPage}>
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.tabContent}>
        {activeTab === 'overview' && <Overview projectId={projectId} />}
        {activeTab === 'messaging' && <Messaging />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default ProjectPage;

