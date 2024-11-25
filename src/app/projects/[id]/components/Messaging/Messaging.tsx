import React, { useState, useEffect } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import Sidebar from './SideBar/Sidebar';
import ChatArea from './ChatArea/ChatArea';
import styles from './Messaging.module.css';

interface ProjectMessagingProps {
  projectId: string;
  currentUser: { id: string; email: string };
}

const ProjectMessaging: React.FC<ProjectMessagingProps> = ({ projectId, currentUser }) => {
  // Change the state to store channel objects with id and name
  const [channelList, setChannelList] = useState<Array<{ id: string; name: string }>>([]);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);
  const supabase = getSupabaseClient();

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('id, name')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching channels:', error.message);
      } else if (data) {
        setChannelList(data);

        // Set the first channel as activeChat if none is selected
        if (!activeChat && data.length > 0) {
          setActiveChat(data[0]);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching channels:', err);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [projectId]);

  const handleAddChannel = async (channelName: string) => {
    const { error } = await supabase.from('channels').insert([
      {
        name: channelName.trim(),
        project_id: projectId,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error adding new channel:', error.message);
    } else {
      fetchChannels(); // Refresh the channel list
    }
  };

  return (
    <div className={styles.messagingContainer}>
      <div className={styles.sidebarContainer}>
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          projectId={projectId}
          currentUserId={currentUser.id}
          channelList={channelList}
          addNewChannel={() => {
            const newChannelName = prompt('Enter channel name:');
            if (newChannelName) handleAddChannel(newChannelName);
          }}
          addNewDm={() => console.log('Direct message creation is not implemented yet.')}
        />
      </div>
      <div className={styles.chatAreaContainer}>
        {activeChat ? (
          <ChatArea
            chatTitle={`#${activeChat.name}`}
            projectId={projectId}
            currentUser={currentUser}
            channelId={activeChat.id} // Pass channelId directly
          />
        ) : (
          <p>Please select a chat to start messaging.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectMessaging;