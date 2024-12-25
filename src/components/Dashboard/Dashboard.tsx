'use client';

import React from 'react';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import useUserProjects from '@/hooks/dashboard/useUserProjects';
import ProtectedComponent from '@/components/ProtectedComponent/protected-page';
import HorizontalProjectList from './MyProjects/HorizontalProjectList/HorizontalProjectList';
import styles from './dashboard.module.css';

const Dashboard: React.FC = () => {
  const user = useAuthRedirect();
  const { projects, loading, error } = useUserProjects(user?.id);

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <ProtectedComponent />
      <h1 className={styles.title}>Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : projects.length > 0 ? (
        <HorizontalProjectList projects={projects} />
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
};

export default Dashboard;