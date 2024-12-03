// File: /components/ChannelsList.tsx

import React, { useEffect, useState } from 'react';
import { fetchChannels, deleteChannel } from '@/services/ProjectSettings/deleteChannel';
import { Channel } from '@/utils/interfaces';
import styles from './RemoveChannels.module.css'; // Import the CSS module
import { toast } from 'react-toastify';

interface DeleteChannelProps {
  projectId: string;
}

const DeleteChannel: React.FC<DeleteChannelProps> = ({ projectId }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);

  useEffect(() => {
    const getChannels = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchChannels(projectId);
        setChannels(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          toast.error(err.message);
        } else {
          setError('An unexpected error occurred.');
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    getChannels();
  }, [projectId]);

  const handleDelete = async (channelId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this channel? This action cannot be undone.');
    if (!confirmDelete) return;

    setDeletingChannelId(channelId);
    setError('');
    try {
      const message = await deleteChannel(projectId, channelId);
      // Remove the deleted channel from the state
      setChannels((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId));
      toast.success(message);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unexpected error occurred.');
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setDeletingChannelId(null);
    }
  };

  if (loading) return <p className={styles.loading}>Loading channels...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
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
              onClick={() => handleDelete(channel.id)}
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
