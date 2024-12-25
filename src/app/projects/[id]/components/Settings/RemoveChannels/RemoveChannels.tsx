'use client';

import React, { useState } from 'react';
import useChannels from '@/hooks/individualProjects/settings/useChannel';
import useDeleteChannel from '@/hooks/individualProjects/settings/useDeleteChannel';
import styles from './RemoveChannels.module.css';
import { toast } from 'react-toastify';

interface DeleteChannelProps {
  projectId: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  channelName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  channelName,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  const handleConfirm = () => {
    if (confirmationInput === channelName) {
      onConfirm();
      onClose(); // Close the modal
      setConfirmationInput(''); // Reset the input field
    } else {
      toast.error('Channel name does not match. Please try again.');
    }
  };


  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}> {/* Close on overlay click */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p>
          Deleting this channel will permanently delete all messages within the channel forever.
        </p>
        <p>Please type the channel name to confirm:</p>
        <input
          type="text"
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
        />
        <div className={styles.modalButtons}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm} disabled={confirmationInput !== channelName}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteChannel: React.FC<DeleteChannelProps> = ({ projectId }) => {
  const { channels, loading, error, refetch } = useChannels(projectId);
  const { deletingChannelId, deleteChannelById, error: deleteError } = useDeleteChannel();
  const [modalOpen, setModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<{ id: string; name: string } | null>(null);



  const handleDelete = async (channelId: string, channelName: string) => {
    setChannelToDelete({ id: channelId, name: channelName });
    setModalOpen(true);
  };



  const handleConfirmDelete = async () => {

    if (channelToDelete) {
      await deleteChannelById(projectId, channelToDelete.id);

      if (!deleteError) {
        refetch();
        toast.success(`Channel "${channelToDelete.name}" deleted successfully.`);
      } else {
        toast.error(`Failed to delete channel "${channelToDelete.name}". Please try again.`);
      }
    }

    setChannelToDelete(null); // Reset channelToDelete after handling confirmation
    setModalOpen(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setChannelToDelete(null); // Reset channelToDelete when closing the modal
  };

  if (loading) return <p className={styles.loading}>Loading channels...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (channels.length === 0) return <p>No channels found.</p>;


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Project Channels</h2>
      </div>
      <ul className={styles.list}>
        {channels.map((channel) => (
          <li key={channel.id} className={styles.listItem}>
            <span className={styles.channelName}>{channel.name}</span>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(channel.id, channel.name)}
              disabled={deletingChannelId === channel.id}
              aria-label={`Delete channel ${channel.name}`}
            >
              ✕
              {deletingChannelId === channel.id && (
                <span className={styles.spinner}></span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        channelName={channelToDelete?.name || ''}
      />
    </div>
  );
};

export default DeleteChannel;