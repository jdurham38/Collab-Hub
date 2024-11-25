import React, { useState, useEffect } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import ChannelCreationModal from '../ChannelCreation/ChannelCreation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeChat: { id: string; name: string } | null;
  setActiveChat: (chat: { id: string; name: string }) => void;
  projectId: string;
  currentUserId: string;
  channelList: Array<{ id: string; name: string }>;
  dmList: string[];
  addNewChannel: () => void;
  addNewDm: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeChat,
  setActiveChat,
  projectId,
  currentUserId,
  channelList,
  // dmList,
  addNewChannel,
  addNewDm,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canCreateChannel, setCanCreateChannel] = useState(false);
  const supabase = getSupabaseClient();

  const validatePrivileges = async () => {
    // Check if the current user is the project owner or an admin collaborator
    const { data: projectOwner } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single();

    if (projectOwner?.created_by === currentUserId) {
      setCanCreateChannel(true);
      return;
    }

    const { data: collaborator } = await supabase
      .from('ProjectCollaborator')
      .select('adminPrivileges')
      .eq('projectId', projectId)
      .eq('userId', currentUserId)
      .single();

    if (collaborator?.adminPrivileges) {
      setCanCreateChannel(true);
    }
  };

  useEffect(() => {
    validatePrivileges();
  }, [projectId, currentUserId]);

  return (
    <div className={styles.sidebar}>
      <h3>Channels</h3>
      <ul>
        {channelList.map((channel) => (
          <li
            key={channel.id}
            className={activeChat?.id === channel.id ? styles.activeChat : ''}
            onClick={() => setActiveChat(channel)}
          >
            #{channel.name}
          </li>
        ))}
      </ul>
      {canCreateChannel && <button onClick={addNewChannel}>Add Channel</button>}

      {/* <h3>Direct Messages</h3>
      <ul>
        {dmList.map((dm) => (
          <li
            key={dm}
            className={activeChat === dm ? styles.activeChat : ''}
            onClick={() => setActiveChat(dm)}
          >
            {dm}
          </li>
        ))}
      </ul> */}
      <button onClick={addNewDm}>Add DM</button>

      {isModalOpen && (
        <ChannelCreationModal
          onClose={() => setIsModalOpen(false)}
          onChannelCreated={() => {
            setIsModalOpen(false);
          }}
          projectId={projectId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default Sidebar;
