// DeleteChannel.tsx

'use client';

import React from 'react';
import useChannels from '@/hooks/individualProjects/settings/useChannel';
import useDeleteChannel from '@/hooks/individualProjects/settings/useDeleteChannel';
import styles from './RemoveChannels.module.css';
import { toast } from 'react-toastify';

interface DeleteChannelProps {
  projectId: string;
}

const DeleteChannel: React.FC<DeleteChannelProps> = ({ projectId }) => {
  const { channels, loading, error, refetch } = useChannels(projectId);
  const { deletingChannelId, deleteChannelById, error: deleteError } = useDeleteChannel();

  const handleDelete = async (channelId: string, channelName: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the channel "${channelName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    await deleteChannelById(projectId, channelId);

    // If deletion was successful, refetch the channel list
    if (!deleteError) {
      refetch();
      toast.success(`Channel "${channelName}" deleted successfully.`);
    } else {
      toast.error(`Failed to delete channel "${channelName}". Please try again.`);
    }
  };

  if (loading) return <p className={styles.loading}>Loading channels...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (channels.length === 0) return <p>No channels found.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Channels</h2>
        {/* Optional: Add a button to add channels */}
        {/* <button className={styles.addButton}>Add Channel</button> */}
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
              &#10005; {/* Unicode for "X" */}
              {deletingChannelId === channel.id && <span className={styles.spinner}></span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeleteChannel;
