'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar/Sidebar';
import ChatArea from './ChatArea/ChatArea';
import styles from './Messaging.module.css';
import { fetchChannels, addChannel } from '@/services/channelService';
interface ProjectMessagingProps {
  projectId: string;
  currentUser: { id: string; email: string; username: string };
}

const ProjectMessaging: React.FC<ProjectMessagingProps> = ({ projectId, currentUser }) => {
  const [channelList, setChannelList] = useState<Array<{ id: string; name: string }>>([]);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

  const loadChannels = async () => {
    try {
      const data = await fetchChannels(projectId);
      setChannelList(data);

      if (!activeChat && data.length > 0) {
        setActiveChat(data[0]);
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  };

  useEffect(() => {
    loadChannels();
  }, [projectId]);

  return (
    <div className={styles.messagingContainer}>
      <div className={styles.sidebarContainer}>
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          projectId={projectId}
          currentUserId={currentUser.id}
          channelList={channelList}
          addNewChannel={async() => {
            await loadChannels();
          }}
        />
      </div>
      <div className={styles.chatAreaContainer}>
        {activeChat ? (
          <ChatArea
            chatTitle={`#${activeChat.name}`}
            projectId={projectId}
            currentUser={currentUser}
            channelId={activeChat.id}
          />
        ) : (
          <p>Please select a chat to start messaging.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectMessaging;
