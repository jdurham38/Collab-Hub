import React, { useState, useEffect } from 'react';
import ChannelListItem from '../ChannelListItem/ChannelListItem';
import ChannelCreationModal from '../ChannelCreation/ChannelCreation';
import { useUnreadStore } from '@/store/useUnreadStore';
import styles from './Sidebar.module.css';
import { validatePrivileges } from '@/services/privilegesService';
import { fetchUnreadCounts } from '@/services/unreadCountService';
import { updateReadStatus } from '@/services/readStatusService';
import getSupabaseClient from '@/lib/supabaseClient/supabase';

interface Channel {
  id: string;
  name: string;
}

interface SidebarProps {
  activeChat: { id: string; name: string } | null;
  setActiveChat: (chat: { id: string; name: string }) => void;
  projectId: string;
  currentUserId: string;
  channelList: Channel[];
  addNewChannel: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeChat,
  setActiveChat,
  projectId,
  currentUserId,
  channelList,
  addNewChannel,
}) => {
  const [canCreateChannel, setCanCreateChannel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const { setUnreadCount, incrementUnreadCount, resetUnreadCount } = useUnreadStore();

  useEffect(() => {
    const checkPrivileges = async () => {
      try {
        const canCreate = await validatePrivileges(projectId, currentUserId);
        setCanCreateChannel(canCreate);
      } catch (error) {
        console.error('Error validating privileges:', error);
      }
    };

    checkPrivileges();
  }, [projectId, currentUserId]);

  useEffect(() => {
    const loadUnreadCounts = async () => {
      try {
        const unreadData = await fetchUnreadCounts(currentUserId);
        unreadData.forEach((item) => {
          setUnreadCount(item.channel_id, item.unread_count);
        });
      } catch (err) {
        console.error('Error fetching unread counts:', err);
      }
    };

    loadUnreadCounts();
  }, [currentUserId, setUnreadCount]);

  useEffect(() => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new;
          if (
            newMessage.user_id !== currentUserId &&
            activeChat?.id !== newMessage.channel_id
          ) {
            incrementUnreadCount(newMessage.channel_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, incrementUnreadCount, activeChat]);

  const handleSetActiveChat = async (channel: { id: string; name: string }) => {
    setActiveChat(channel);

    try {
      await updateReadStatus(channel.id, currentUserId);
      resetUnreadCount(channel.id);
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  };

  const handleChannelCreated = () => {
    addNewChannel(); // Reload the channel list after a new channel is added
  };

  return (
    <div className={styles.sidebar}>
      <h3>Channels</h3>
      <ul>
        {channelList.map((channel) => (
          <ChannelListItem
            key={channel.id}
            channel={channel}
            isActive={activeChat?.id === channel.id}
            onClick={() => handleSetActiveChat(channel)}
          />
        ))}
      </ul>
      {canCreateChannel && (
        <button
          onClick={() => setIsModalOpen(true)} // Open the modal
          className={styles.addChannelButton}
        >
          Add Channel
        </button>
      )}

      {isModalOpen && (
        <ChannelCreationModal
          onClose={() => setIsModalOpen(false)} // Close the modal
          onChannelCreated={handleChannelCreated} // Callback for when a channel is created
          projectId={projectId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default Sidebar;
