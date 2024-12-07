import React, { useState } from 'react';
import ChannelListItem from '../ChannelListItem/ChannelListItem';
import ChannelCreationModal from '../ChannelCreation/ChannelCreation';
import { useUnreadStore } from '@/store/useUnreadStore';
import styles from './Sidebar.module.css';
import { updateReadStatus } from '@/services/readStatusService';

// Corrected imports for custom hooks
import useCanCreateChannel from '@/hooks/individualProjects/messages/sidebar/useCanCreateChannel';
import useLoadUnreadCounts from '@/hooks/individualProjects/messages/sidebar/useLoadUnreadCounts';
import useMessageSubscription from '@/hooks/individualProjects/messages/sidebar/useMessageSubscription';

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
  const { setUnreadCount, incrementUnreadCount, resetUnreadCount } = useUnreadStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canCreateChannel = useCanCreateChannel(projectId, currentUserId);
  useLoadUnreadCounts(currentUserId, setUnreadCount);
  useMessageSubscription(currentUserId, incrementUnreadCount, activeChat);

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
    addNewChannel();
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
        <button onClick={() => setIsModalOpen(true)} className={styles.addChannelButton}>
          Add Channel
        </button>
      )}

      {isModalOpen && (
        <ChannelCreationModal
          onClose={() => setIsModalOpen(false)}
          onChannelCreated={handleChannelCreated}
          projectId={projectId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default Sidebar;
