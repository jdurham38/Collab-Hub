'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar/Sidebar';
import ChatArea from './ChatArea/ChatArea';
import DirectMessageChatArea from './ChatArea/DirectMessageChatArea';
import styles from './Messaging.module.css';
import { fetchChannels } from '@/services/channelService';
import { User } from '@/utils/interfaces';

interface ProjectMessagingProps {
  projectId: string;
  currentUser: User;
}

const ProjectMessaging: React.FC<ProjectMessagingProps> = ({ projectId, currentUser }) => {
  const [channelList, setChannelList] = useState<Array<{ id: string; name: string }>>([]);
  const [activeChat, setActiveChat] = useState<{
    id: string;
    name: string;
    type?: 'channel' | 'dm';
    recipient_id?: string;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const ArrowIcon = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
    );
  };

  const loadChannels = async () => {
    try {
      const data = await fetchChannels(projectId);
      setChannelList(data);

      if (!activeChat && data.length > 0) {
        setActiveChat({ ...data[0], type: 'channel' });
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  };

  useEffect(() => {
    loadChannels();
  }, [projectId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.messagingContainer}>
      <button className={`${styles.sidebarToggleButton} ${isSidebarOpen ? styles.open: ''}`} onClick={toggleSidebar}>
        <ArrowIcon />
      </button>

      <div className={`${styles.sidebarContainer} ${isSidebarOpen ? '' : styles.hidden}`}>
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          projectId={projectId}
          currentUserId={currentUser.id}
          channelList={channelList}
          addNewChannel={async () => {
            await loadChannels();
          }}
        />
      </div>
      <div className={styles.chatAreaContainer}>
        {activeChat && activeChat.type === 'channel' && (
          <ChatArea
            chatTitle={`#${activeChat.name}`}
            projectId={projectId}
            currentUser={currentUser}
            channelId={activeChat.id}
          />
        )}
        {activeChat && activeChat.type === 'dm' && activeChat.recipient_id && (
          <DirectMessageChatArea
            recipient_id={activeChat.recipient_id}
            projectId={projectId}
            currentUser={currentUser}
          />
        )}
        {!activeChat && <p>Please select a chat to start messaging.</p>}
      </div>
    </div>
  );
};

export default ProjectMessaging;