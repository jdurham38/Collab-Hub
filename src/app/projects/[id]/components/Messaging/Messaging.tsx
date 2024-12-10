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

  // Use useEffect to log the activeChat state whenever it changes
  useEffect(() => {
    console.log("Active chat updated:", activeChat);
  }, [activeChat]);

  return (
    <div className={styles.messagingContainer}>
      <div className={styles.sidebarContainer}>
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat} // Pass down the function to update the state
          projectId={projectId}
          currentUserId={currentUser.id}
          channelList={channelList}
          addNewChannel={async () => {
            await loadChannels();
          }}
        />
      </div>
      <div className={styles.chatAreaContainer}>
        {/* Correctly check for activeChat and render the appropriate chat area */}
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