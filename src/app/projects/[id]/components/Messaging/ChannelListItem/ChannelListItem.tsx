
import React from 'react';
import { useUnreadStore } from '@/store/useUnreadStore';
import styles from './ChannelListItem.module.css';

interface Channel {
  id: string;
  name: string;
}

interface ChannelListItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}

const ChannelListItem: React.FC<ChannelListItemProps> = ({ channel, isActive, onClick }) => {
  const { unreadCounts } = useUnreadStore();
  const unreadCount = unreadCounts[channel.id] || 0;

  return (
    <li
      className={`${styles.channelListItem} ${isActive ? styles.activeChat : ''}`}
      onClick={onClick}
    >
      <span className={styles.channelName}>#{channel.name}</span>
      {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
    </li>
  );
};

export default ChannelListItem;
