'use client';

import React from 'react';
import useCollaborators from '@/hooks/individualProjects/settings/useCollaborators';
import useToggleAdminAccess from '@/hooks/individualProjects/settings/useToggleAdminAccess';
import styles from './AdminAccess.module.css';

interface AdminAccessProps {
  projectId: string;
}

const AdminAccess: React.FC<AdminAccessProps> = ({ projectId }) => {
  const { collaborators, loading, error, setCollaborators } = useCollaborators(projectId);
  const { updatingUserId, toggleAdmin } = useToggleAdminAccess();

  const handleToggle = async (userId: string, fields: Partial<{
    adminPrivileges: boolean;
    canRemoveUser: boolean;
    canRemoveChannel: boolean;
    canEditProject: boolean;
  }>) => {
    // Optimistic UI update
    setCollaborators((prev) =>
      prev.map((collab) => (collab.userId === userId ? { ...collab, ...fields } : collab))
    );

    const success = await toggleAdmin(projectId, userId, fields);

    if (!success) {
      // If the toggle failed, consider re-fetching or showing an error toast.
      // Currently, just logging an error. You may want to implement revert logic or re-fetch here.
      console.error('Failed to update privileges. Consider reloading the page.');
    }
  };

  if (loading) return <p className={styles.statusMessage}>Loading collaborators...</p>;
  if (error) return <p className={`${styles.statusMessage} ${styles.error}`}>Error: {error}</p>;
  if (collaborators.length === 0) return <p className={styles.statusMessage}>No collaborators found.</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Collaborators</h2>
      <ul className={styles.list}>
        {collaborators.map((collaborator) => {
          const {
            userId,
            username,
            email,
            adminPrivileges,
            canRemoveUser,
            canRemoveChannel,
            canEditProject,
          } = collaborator;

          const disabled = updatingUserId === userId;

          const handleAdminChange = () => {
            const newAdmin = !adminPrivileges;
            handleToggle(userId, {
              adminPrivileges: newAdmin,
              canRemoveUser: newAdmin ? true : canRemoveUser,
              canRemoveChannel: newAdmin ? true : canRemoveChannel,
              canEditProject: newAdmin ? true : canEditProject,
            });
          };
          

          const handlePermissionChange = (field: 'canRemoveUser' | 'canRemoveChannel' | 'canEditProject') => {
            if (adminPrivileges) return;
            handleToggle(userId, {
              adminPrivileges,       // always include current adminPrivileges
              canRemoveUser,
              canRemoveChannel,
              canEditProject,
              [field]: !collaborator[field]  // toggle the specific field
            });
          };
          

          return (
            <li key={userId} className={styles.listItem}>
              <span className={styles.userLabel}>
                {username || email || userId}
              </span>
              <div className={styles.toggles}>
                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Admin</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={adminPrivileges}
                      onChange={handleAdminChange}
                      disabled={disabled}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Remove User</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={canRemoveUser}
                      onChange={() => handlePermissionChange('canRemoveUser')}
                      disabled={disabled || adminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Remove Channel</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={canRemoveChannel}
                      onChange={() => handlePermissionChange('canRemoveChannel')}
                      disabled={disabled || adminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Edit Project</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={canEditProject}
                      onChange={() => handlePermissionChange('canEditProject')}
                      disabled={disabled || adminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {disabled && <span className={styles.loadingSpinner}></span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminAccess;
