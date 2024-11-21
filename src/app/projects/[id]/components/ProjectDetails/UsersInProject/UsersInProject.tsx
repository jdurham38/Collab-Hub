import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getProjectUsers } from '@/services/IndividualProjects/getProjectUsers';
import styles from './UsersInProject.module.css';

interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
}

interface ProjectUsersProps {
  projectId: string;
}

const ProjectUsers: React.FC<ProjectUsersProps> = ({ projectId }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projectUsers', projectId],
    queryFn: () => getProjectUsers(projectId),
  });

  if (isLoading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        Error:{' '}
        {error instanceof Error
          ? error.message
          : 'An error occurred while fetching users.'}
      </div>
    );
  }

  if (!data) {
    return <div className={styles.error}>No user data available.</div>;
  }

  const { owner, users } = data;

  return (
    <div className={styles.userContainer}>
      <h2>Project Users</h2>

      <div className={styles.ownerSection}>
        <h3>Owner</h3>
        {owner ? (
          <div className={styles.userCard}>
            <p>{owner.username || owner.email || 'Owner information unavailable'}</p>
          </div>
        ) : (
          <p>Owner information not available.</p>
        )}
      </div>

      <div className={styles.collaboratorsSection}>
        <h3>Collaborators</h3>
        {users && users.length > 0 ? (
          <div className={styles.userList}>
            {users.map((user: User) => (
              <div key={user.id} className={styles.userCard}>
                <p>{user.username || user.email}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>
            No collaborators yet.{' '}
            <Link href="/discover-people" className={styles.findPeopleLink}>
              Find people now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectUsers;
