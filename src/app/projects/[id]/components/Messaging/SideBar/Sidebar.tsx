'use client';

import React, { useState, useEffect } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import ChannelListItem from '../ChannelListItem/ChannelListItem';
import { useUnreadStore } from '@/store/useUnreadStore';
import styles from './Sidebar.module.css';

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
  const supabase = getSupabaseClient();
  const { setUnreadCount, incrementUnreadCount, resetUnreadCount } = useUnreadStore();

  const validatePrivileges = async () => {
    try {
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
    } catch (error) {
      console.error('Error validating privileges:', error);
    }
  };

  useEffect(() => {
    validatePrivileges();
  }, [projectId, currentUserId]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const { data: unreadData, error } = await supabase.rpc('get_unread_counts', {
          p_user_id: currentUserId,
        });

        if (error) {
          console.error('Error fetching unread counts:', error.message);
        } else {
          unreadData.forEach((item: { channel_id: string; unread_count: number }) => {
            setUnreadCount(item.channel_id, item.unread_count);
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching unread counts:', err);
      }
    };

    fetchUnreadCounts();
  }, [projectId, currentUserId, setUnreadCount]);

  useEffect(() => {
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
      await supabase.from('channel_read_status').upsert(
        {
          user_id: currentUserId,
          channel_id: channel.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,channel_id' }
      );

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
