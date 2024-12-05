// /components/AdminAccess.tsx

'use client';

import React from 'react';
import useCollaborators from '@/hooks/individualProjects/settings/useCollaborators';
import useToggleAdminAccess from '@/hooks/individualProjects/settings/useToggleAdminAccess';
import styles from './AdminAccess.module.css'; // Import the CSS module

interface AdminAccessProps {
  projectId: string;
}

const AdminAccess: React.FC<AdminAccessProps> = ({ projectId }) => {
  const { collaborators, loading, error, refetch, setCollaborators } = useCollaborators(projectId);
  const { updatingUserId, toggleAdmin, error: toggleError } = useToggleAdminAccess();

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    // Optimistically update the UI
    setCollaborators((prevCollaborators) =>
      prevCollaborators.map((collab) =>
        collab.userId === userId ? { ...collab, adminPrivileges: !currentStatus } : collab
      )
    );

    const success = await toggleAdmin(projectId, userId, currentStatus);

    if (!success) {
      // Revert the change if the toggle failed
      setCollaborators((prevCollaborators) =>
        prevCollaborators.map((collab) =>
          collab.userId === userId ? { ...collab, adminPrivileges: currentStatus } : collab
        )
      );
    }
  };

  if (loading) return <p className={styles.loading}>Loading collaborators...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (collaborators.length === 0) return <p>No collaborators found.</p>;

  return (
    <div className={styles.container}>
      <h2>Collaborators</h2>
      <ul className={styles.list}>
        {collaborators.map((collaborator) => (
          <li key={collaborator.userId} className={styles.listItem}>
            <span>
              {collaborator.username
                ? collaborator.username
                : collaborator.email
                ? collaborator.email
                : collaborator.userId}
            </span>

            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={collaborator.adminPrivileges}
                onChange={() => handleToggle(collaborator.userId, collaborator.adminPrivileges)}
                disabled={updatingUserId === collaborator.userId}
                aria-label={`Toggle admin access for ${collaborator.username || collaborator.email || collaborator.userId}`}
              />
              <span className={styles.slider}></span>
              {updatingUserId === collaborator.userId && <span className={styles.loadingSpinner}></span>}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAccess;
