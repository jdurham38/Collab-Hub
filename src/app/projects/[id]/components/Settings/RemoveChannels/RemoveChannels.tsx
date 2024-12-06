// /components/ChannelsList.tsx

'use client';

import React from 'react';
import useChannels from '@/hooks/individualProjects/settings/useChannel';
import useDeleteChannel from '@/hooks/individualProjects/settings/useDeleteChannel';
import styles from './RemoveChannels.module.css'; // Import the CSS module

interface DeleteChannelProps {
  projectId: string;
}

const DeleteChannel: React.FC<DeleteChannelProps> = ({ projectId }) => {
  const { channels, loading, error } = useChannels(projectId);
  const { deletingChannelId, deleteChannelById, error: deleteError } = useDeleteChannel();

  const handleDelete = async (channelId: string, channelName: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the channel "${channelName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    await deleteChannelById(projectId, channelId);

    // Optionally, you can refetch channels or update the local state here
    // For simplicity, we'll remove the channel from the list if deletion was successful
    if (!deleteError) {
      // Assuming channels are updated in the useChannels hook or via a global state
      // If not, you might need to implement a state update here
    }
  };

  if (loading) return <p className={styles.loading}>Loading channels...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (channels.length === 0) return <p>No channels found.</p>;

  return (
    <div className={styles.container}>
      <h2>Channels</h2>
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
              X
              {deletingChannelId === channel.id && <span className={styles.spinner}></span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeleteChannel;
