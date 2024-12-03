import React, { useEffect, useState } from 'react';
import { fetchCollaborators, toggleAdminAccess, Collaborator } from '@/services/ProjectSettings/adminAccess';
import styles from './AdminAccess.module.css'; // Import the CSS module

interface AdminAccessProps {
  projectId: string;
}

const AdminAccess: React.FC<AdminAccessProps> = ({ projectId }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCollaborators = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCollaborators(projectId);
        setCollaborators(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    getCollaborators();
  }, [projectId]);

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    setError('');
    try {
      const response = await toggleAdminAccess(projectId, userId, !currentStatus);
  
      if (response && typeof response.adminPrivileges === 'boolean') {
        setCollaborators((prev) =>
          prev.map((collab) =>
            collab.userId === userId
              ? { ...collab, adminPrivileges: response.adminPrivileges }
              : collab
          )
        );
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setUpdatingUserId(null);
    }
  };
  

  if (loading) return <p>Loading collaborators...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
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
