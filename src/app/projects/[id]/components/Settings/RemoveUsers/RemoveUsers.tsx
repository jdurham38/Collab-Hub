'use client';

import React, { useState } from 'react';
import { removeCollaborator } from '@/services/ProjectSettings/removeCollaborator';
import useCollaborators from '@/hooks/individualProjects/settings/useCollaborators';
import { Collaborator } from '@/utils/interfaces';
import styles from './RemoveUsers.module.css';
import { toast } from 'react-toastify';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className={styles.modalButtons}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

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
  const [showModal, setShowModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState<Collaborator | null>(null);

  const handleRemoveClick = (collab: Collaborator) => {
    setUserToRemove(collab);
    setShowModal(true);
  };

  const handleRemove = async () => {
    try {
      if (!userToRemove) return;
      if (!userIsOwner && !canRemoveUser) {
        toast.error('You do not have permission to remove collaborators.');
        return;
      }

      if (userToRemove.userId === currentUserId) {
        toast.error('You cannot remove yourself.');
        return;
      }

      await removeCollaborator(projectId, userToRemove.userId, currentUserId);
      setCollaborators((prev) =>
        prev.filter((c) => c.userId !== userToRemove.userId),
      );
      toast.success('Collaborator removed successfully.');
    } catch (err) {
      let errorMessage = 'Failed to remove collaborator';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      toast.error(errorMessage);
      refetch();
    } finally {
      setShowModal(false);
      setUserToRemove(null);
    }
  };

  if (loading)
    return <p className={styles.loading}>Loading collaborators...</p>;
  if (error) return <p className={`${styles.error}`}>Error: {error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Project Collaborators</h2>
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleRemove}
        message={`Are you sure you want to remove ${userToRemove?.username || userToRemove?.email}?`}
      />

      <ul className={styles.list}>
        {collaborators.map((collab) => (
          <li key={collab.userId} className={styles.listItem}>
            <span className={styles.userLabel}>
              {collab.username || collab.email || collab.userId}
            </span>
            {(userIsOwner || canRemoveUser) &&
              collab.userId !== currentUserId && (
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveClick(collab)}
                  aria-label={`Remove user ${collab.username || collab.email}`}
                >
                  ✕
                </button>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RemoveUsers;
