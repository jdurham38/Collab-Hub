// components/Settings/AdminAccess/AdminAccess.tsx

'use client';

import React from 'react';
import useCollaborators from '@/hooks/individualProjects/settings/useCollaborators';
import useToggleAdminAccess from '@/hooks/individualProjects/settings/useToggleAdminAccess';
import { Collaborator } from '@/utils/interfaces';
import styles from './AdminAccess.module.css';
import { toast } from 'react-toastify';

interface AdminAccessProps {
  projectId: string;
}

const AdminAccess: React.FC<AdminAccessProps> = ({ projectId }) => {
  const { collaborators, loading, error, refetch } = useCollaborators(projectId);
  const { updatePermissions } = useToggleAdminAccess();

  const [modifiedCollaborators, setModifiedCollaborators] = React.useState<{
    [userId: string]: Partial<Collaborator>;
  }>({});
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // **Debugging: Log collaborator data**
  React.useEffect(() => {
    console.log('Collaborators:', collaborators);
  }, [collaborators]);

  const handleToggle = (
    userId: string,
    fields: Partial<{
      adminPrivileges: boolean;
      canRemoveUser: boolean;
      canRemoveChannel: boolean;
      canEditProject: boolean;
      canEditAdminAccess: boolean;
    }>
  ) => {
    setModifiedCollaborators((prev) => {
      const existingChanges = prev[userId] || {};
      const updatedFields = { ...existingChanges, ...fields };

      if (fields.adminPrivileges !== undefined) {
        if (fields.adminPrivileges) {
          updatedFields.canRemoveUser = true;
          updatedFields.canRemoveChannel = true;
          updatedFields.canEditProject = true;
          updatedFields.canEditAdminAccess = true;
        }
      }

      return { ...prev, [userId]: updatedFields };
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    toast.dismiss();

    try {
      const updatePromises = Object.entries(modifiedCollaborators).map(
        async ([userId, fields]) => {
          const success = await updatePermissions(projectId, userId, fields);
          if (!success) {
            throw new Error(`Failed to update privileges for user ID: ${userId}`);
          }
        }
      );

      await Promise.all(updatePromises);
      toast.success('All privileges updated successfully.');
      setModifiedCollaborators({});
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
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
           
          } = collaborator;

          const mergedCollaborator = { ...collaborator, ...modifiedCollaborators[userId] };
          const {
            adminPrivileges: mergedAdminPrivileges,
            canRemoveUser: mergedCanRemoveUser,
            canRemoveChannel: mergedCanRemoveChannel,
            canEditProject: mergedCanEditProject,
            canEditAdminAccess: mergedCanEditAdminAccess,
          } = mergedCollaborator;

          const hasChanges = !!modifiedCollaborators[userId];
          const disabled = isSaving;

          const handleAdminChange = () => {
            const newAdmin = !mergedAdminPrivileges;
            handleToggle(userId, {
              adminPrivileges: newAdmin,
              canRemoveUser: newAdmin ? true : mergedCanRemoveUser,
              canRemoveChannel: newAdmin ? true : mergedCanRemoveChannel,
              canEditProject: newAdmin ? true : mergedCanEditProject,
              canEditAdminAccess: newAdmin ? true : mergedCanEditAdminAccess,
            });
          };

          const handlePermissionChange = (
            field: 'canRemoveUser' | 'canRemoveChannel' | 'canEditProject' | 'canEditAdminAccess'
          ) => {
            if (mergedAdminPrivileges) {
              return;
            }
            const newValue = !mergedCollaborator[field];
            handleToggle(userId, {
              [field]: newValue,
            });
          };

          return (
            <li key={userId} className={styles.listItem}>
              <span className={styles.userLabel}>{username || email || userId}</span>
              <div className={styles.toggles}>
                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Full Privileges</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={mergedAdminPrivileges}
                      onChange={handleAdminChange}
                      disabled={disabled}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Can Remove Collaborators</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={mergedCanRemoveUser}
                      onChange={() => handlePermissionChange('canRemoveUser')}
                      disabled={disabled || mergedAdminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Can Remove Channels</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={mergedCanRemoveChannel}
                      onChange={() => handlePermissionChange('canRemoveChannel')}
                      disabled={disabled || mergedAdminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Can Edit The Project</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={mergedCanEditProject}
                      onChange={() => handlePermissionChange('canEditProject')}
                      disabled={disabled || mergedAdminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switchLabel}>Can Edit Admin Access</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={mergedCanEditAdminAccess}
                      onChange={() => handlePermissionChange('canEditAdminAccess')}
                      disabled={disabled || mergedAdminPrivileges}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {hasChanges && <span className={styles.unsavedIndicator}>•</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={handleSaveChanges}
        disabled={isSaving || Object.keys(modifiedCollaborators).length === 0}
        className={styles.saveButton}
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default AdminAccess;
