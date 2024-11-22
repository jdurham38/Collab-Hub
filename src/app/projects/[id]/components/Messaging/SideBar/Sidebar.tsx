// Sidebar/Sidebar.tsx

import React from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  channelList: string[];
  dmList: string[];
  addNewChannel: () => void;
  addNewDm: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeChat,
  setActiveChat,
  channelList,
  dmList,
  addNewChannel,
  addNewDm,
}) => {
  return (
    <div className={styles.sidebar}>
      <h3>Channels</h3>
      <ul>
        {channelList.map((channel) => (
          <li
            key={channel}
            className={activeChat === channel ? styles.activeChat : ''}
            onClick={() => setActiveChat(channel)}
          >
            #{channel}
          </li>
        ))}
      </ul>
      <button onClick={addNewChannel}>Add Channel</button>

      <h3>Direct Messages</h3>
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
      </ul>
      <button onClick={addNewDm}>Add DM</button>
    </div>
  );
};

export default Sidebar;
