import React, { useState } from 'react';
import ChannelListItem from '../ChannelListItem/ChannelListItem';
import ChannelCreationModal from '../ChannelCreation/ChannelCreation';
import { useUnreadStore } from '@/store/useUnreadStore';
import styles from './Sidebar.module.css';
import { updateReadStatus } from '@/services/readStatusService';
import useCollaborators from '@/hooks/individualProjects/messages/chatArea/useCollaborators';
import useCanCreateChannel from '@/hooks/individualProjects/messages/sidebar/useCanCreateChannel';
import useLoadUnreadCounts from '@/hooks/individualProjects/messages/sidebar/useLoadUnreadCounts';
import useMessageSubscription from '@/hooks/individualProjects/messages/sidebar/useMessageSubscription';

interface Channel {
  id: string;
  name: string;
}

interface SidebarProps {
  activeChat: { id: string; name: string; type?: 'channel' | 'dm'; recipient_id?: string } | null;
  setActiveChat: (chat: {
    id: string;
    name: string;
    type?: 'channel' | 'dm';
    recipient_id?: string;
  }) => void;
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const canCreateChannel = useCanCreateChannel(projectId, currentUserId);
  useLoadUnreadCounts(currentUserId, setUnreadCount);
  useMessageSubscription(currentUserId, incrementUnreadCount, activeChat);

    const {
        collaborators,
        isLoading: isLoadingCollaborators,
        error: collaboratorsError,
        projectOwner,
    } = useCollaborators(projectId);


    const handleSetActiveChat = async (chat: {
        id: string;
        name: string;
        type?: 'channel' | 'dm';
        recipient_id?: string;
    }) => {
        setActiveChat(chat);
        if (chat.type === 'channel') {
            try {
                await updateReadStatus(chat.id, currentUserId);
                resetUnreadCount(chat.id);
            } catch (error) {
                console.error('Error updating read status:', error);
            }
        }
    };

  const handleChannelCreated = () => {
    addNewChannel();
  };

  if (isLoadingCollaborators || collaborators === null) {
    return <div className={styles.sidebar}>Loading collaborators...</div>;
  }

  if (collaboratorsError) {
    return <div className={styles.sidebar}>Error loading collaborators.</div>;
  }

  const allCollaborators = projectOwner ? [...collaborators, {
    ...projectOwner,
      userId: projectOwner.id,
    } ] : collaborators

    console.log(allCollaborators)

  return (
    <div className={styles.sidebar}>
      <h3>Channels</h3>
      <ul>
        {channelList.map((channel) => (
          <ChannelListItem
            key={channel.id}
            channel={channel}
            isActive={activeChat?.id === channel.id && activeChat?.type === 'channel'}
            onClick={() => handleSetActiveChat({ ...channel, type: 'channel' })}
          />
        ))}
      </ul>
      {canCreateChannel && (
        <button onClick={() => setIsModalOpen(true)} className={styles.addChannelButton}>
          Add Channel
        </button>
      )}

      <h3>Collaborators</h3>
      <ul className={styles.collaboratorList}>
        {allCollaborators.map((collaborator) => (
          <li
            key={collaborator.userId}
              className={`${styles.collaboratorItem} ${
                  activeChat?.recipient_id === collaborator.userId && activeChat?.type === 'dm'
                      ? styles.active
                      : ''
              }`}
              onClick={() => {
                  handleSetActiveChat({
                      id: collaborator.userId,
                      name: collaborator.username || collaborator.email,
                      type: 'dm',
                      recipient_id: collaborator.userId,
                  });
              }}
          >
            {collaborator.username || collaborator.email}

          </li>
        ))}
      </ul>

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