// ChannelCreationModal.tsx

import React, { useState } from 'react';
import styles from './ChannelCreationModal.module.css';
import { addChannel } from '@/services/channelService';

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

  const handleCreateChannel = async () => {
    setError('');
    if (channelName.trim() === '') {
      setError('Channel name cannot be empty');
      return;
    }
  
    try {
      await addChannel(projectId, channelName.trim(), currentUserId);
      setChannelName('');
      onChannelCreated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create channel. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
