import React from 'react';
import styles from './Sidebar.module.css';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string;
}

type ChatType = 'channel' | 'dm';

interface Chat {
  type: ChatType;
  messages: Message[];
}

interface Chats {
  [key: string]: Chat;
}

interface SidebarProps {
  activeChat: string;
  setActiveChat: (chat: string) => void;
  channelList: string[];
  dmList: string[];
  addNewChannel: () => void;
  addNewDm: () => void;
  chats: Chats;
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
      {/* Channels Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Channels</span>
          <button className={styles.addButton} onClick={addNewChannel}>
            +
          </button>
        </div>
        <ul className={styles.channelList}>
          {channelList.map((channel) => (
            <li key={channel}>
              <button
                className={`${styles.button} ${
                  activeChat === channel ? styles.active : ''
                }`}
                onClick={() => setActiveChat(channel)}
              >
                #{channel}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Direct Messages Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Direct Messages</span>
          <button className={styles.addButton} onClick={addNewDm}>
            +
          </button>
        </div>
        <ul className={styles.dmList}>
          {dmList.map((dm) => (
            <li key={dm}>
              <button
                className={`${styles.button} ${
                  activeChat === dm.toLowerCase() ? styles.active : ''
                }`}
                onClick={() => setActiveChat(dm.toLowerCase())}
              >
                {dm}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
