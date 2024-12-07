// components/Settings/RemoveUsers/RemoveUsers.tsx
'use client';

import React from 'react';
import { removeCollaborator } from '@/services/ProjectSettings/removeCollaborator';
import useCollaborators from '@/hooks/individualProjects/settings/useCollaborators';
import { Collaborator } from '@/utils/interfaces';
import styles from './RemoveUsers.module.css';
import { toast } from 'react-toastify';

interface RemoveUsersProps {
  projectId: string;
  currentUserId: string;
  userIsOwner: boolean;
  canRemoveUser: boolean;
}

const RemoveUsers: React.FC<RemoveUsersProps> = ({
  projectId,
  currentUserId,
  userIsOwner,
  canRemoveUser,
}) => {
  const { collaborators, loading, error, setCollaborators, refetch } =
    useCollaborators(projectId);

  if (loading) return <p>Loading collaborators...</p>;
  if (error)
    return <p className={`${styles.error}`}>Error: {error}</p>;

  const handleRemove = async (collab: Collaborator) => {
    try {
      if (!userIsOwner && !canRemoveUser) {
        toast.error('You do not have permission to remove collaborators.');
        return;
      }

      // Prevent removing the current user
      if (collab.userId === currentUserId) {
        toast.error('You cannot remove yourself.');
        return;
      }

      // Optimistic UI update
      setCollaborators((prev) =>
        prev.filter((c) => c.userId !== collab.userId)
      );

      // Pass currentUserId as requesterId
      await removeCollaborator(projectId, collab.userId, currentUserId);

      toast.success('Collaborator removed successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove collaborator');
      // Revert on failure by refetching
      refetch();
    }
  };

  return (
    <div className={styles.container}>
      <h3>Remove Users</h3>
      {collaborators.length === 0 ? (
        <p>No collaborators found.</p>
      ) : (
        <ul className={styles.list}>
          {collaborators.map((collab) => (
            <li key={collab.userId} className={styles.listItem}>
              <span>
                {collab.username || collab.email || collab.userId}
              </span>
              {(userIsOwner || canRemoveUser) &&
                collab.userId !== currentUserId && (
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(collab)}
                  >
                    Remove
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RemoveUsers;
