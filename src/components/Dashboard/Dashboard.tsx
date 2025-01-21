'use client';

import React from 'react';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import useUserProjects from '@/hooks/dashboard/useUserProjects';
import ProtectedComponent from '@/components/ProtectedComponent/protected-page';
import HorizontalProjectList from './MyProjects/HorizontalProjectList/HorizontalProjectList';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';
import useProjectRequestNotifications from '@/hooks/notifications/useProjectRequestNotifications';
const Dashboard: React.FC = () => {
  const user = useAuthRedirect();
    const { projects, loading, error } = useUserProjects(user?.id);
    const { requestCount, loading: requestLoading, error: requestError} = useProjectRequestNotifications()

    const router = useRouter();

    if (!user) {
        return <div>Redirecting...</div>;
    }

    const handleNotificationsClick = () => {
        router.push('/notifications');
    };
    
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

        <div
            onClick={handleNotificationsClick}
            className={styles.notificationCard}
        >
             Notifications
            {requestLoading ? (
                    <div>Loading...</div>
                ) : requestError ? (
                    <div className={styles.error}>{requestError}</div>
                ) : requestCount > 0 && (
                    <span className={styles.notificationCount}>
                     {requestCount}
                 </span>
            )}

        </div>

    </div>
  );
};

export default Dashboard;