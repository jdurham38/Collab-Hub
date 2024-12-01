'use client';

import React, { useState, useEffect } from 'react';
import ChannelListItem from '../ChannelListItem/ChannelListItem';
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
  addNewDm: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeChat,
  setActiveChat,
  projectId,
  currentUserId,
  channelList,
  addNewChannel,
  addNewDm,
}) => {
  const [canCreateChannel, setCanCreateChannel] = useState(false);
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
    // The subscription to real-time messages remains in the client
    // as it requires client-side Supabase SDK
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
      {canCreateChannel && <button onClick={addNewChannel}>Add Channel</button>}

      <h3>Direct Messages</h3>
      <button onClick={addNewDm}>Add DM</button>
    </div>
  );
};

export default Sidebar;
