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
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChannel = async () => {
    console.log('handleCreateChannel called'); // Debugging
    setError('');
    if (channelName.trim() === '') {
      setError('Channel name cannot be empty');
      return;
    }

    try {
      setIsCreating(true);
      await addChannel(projectId, channelName.trim(), currentUserId);
      setChannelName('');
      onChannelCreated();
      onClose();
    } catch (err) {
      if(err instanceof Error){
        if (err.message?.includes('status code 500')) {
          setError('Your plan cannot exceed 5 channels for this project.');
        } else{
          setError(err.message || 'Failed to create channel. Please try again.');
        }
      } else if(typeof err === 'string'){
        setError(err);
      } 
      else{
        setError('an unexpected error has occurred')
      }
    
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
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
          <button
            type="button" // Explicitly set type to button
            onClick={handleCreateChannel}
            className={styles.modalButton}
            disabled={isCreating} // Disable while creating
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={onClose} className={styles.modalButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelCreationModal;
