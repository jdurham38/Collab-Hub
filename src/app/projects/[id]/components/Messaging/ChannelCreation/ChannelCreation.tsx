import React, { useState } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import styles from './ChannelCreationModal.module.css';

interface ChannelCreationModalProps {
  onClose: () => void;
  onChannelCreated: () => void;
  projectId: string;
  currentUserId: string;
}

const ChannelCreationModal: React.FC<ChannelCreationModalProps> = ({
  onClose,
  onChannelCreated,
  projectId,
  currentUserId,
}) => {
  const [channelName, setChannelName] = useState('');
  const [error, setError] = useState('');
  const supabase = getSupabaseClient();

  const validateAdminPrivileges = async () => {
    // Check if the current user is the project owner or an admin collaborator
    const { data: projectOwner, error: ownerError } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single();

    if (ownerError) {
      setError('Failed to validate project owner');
      return false;
    }

    if (projectOwner?.created_by === currentUserId) {
      return true; // User is the project owner
    }

    // Check if the user is a collaborator with admin privileges
    const { data: collaborator, error: collaboratorError } = await supabase
      .from('ProjectCollaborator')
      .select('adminPrivileges')
      .eq('projectId', projectId)
      .eq('userId', currentUserId)
      .single();

    if (collaboratorError || !collaborator?.adminPrivileges) {
      setError('You do not have permission to create a channel.');
      return false;
    }

    return true;
  };

  const handleCreateChannel = async () => {
    setError('');
    if (channelName.trim() === '') {
      setError('Channel name cannot be empty');
      return;
    }

    // Validate admin privileges
    const hasPrivileges = await validateAdminPrivileges();
    if (!hasPrivileges) {
      return;
    }

    // Insert new channel into the database
    const { error: insertError } = await supabase.from('channels').insert([
      {
        name: channelName.trim(),
        project_id: projectId,
        created_by: currentUserId,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError('Failed to create channel. Please try again.');
    } else {
      setChannelName('');
      onChannelCreated();
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Create a New Channel</h3>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Enter channel name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className={styles.modalInput}
        />
        <div className={styles.modalActions}>
          <button onClick={handleCreateChannel} className={styles.modalButton}>
            Create
          </button>
          <button onClick={onClose} className={styles.modalButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelCreationModal;
