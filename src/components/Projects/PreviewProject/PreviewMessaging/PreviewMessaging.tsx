import React, { useState } from 'react';
import ChatArea from './ChatArea/ChatArea';
import Sidebar from './SideBar/Sidebar';
import styles from './PreviewMessaging.module.css';

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

const PreviewMessaging: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string>('general');

  const [chats, setChats] = useState<Chats>({
    general: {
      type: 'channel',
      messages: [
        {
          id: 1,
          user: 'Alice',
          text: 'Welcome to the general channel!',
          timestamp: '9:00 AM',
        },
        { id: 2, user: 'Bob', text: 'Hi everyone!', timestamp: '9:05 AM' },
      ],
    },
    random: {
      type: 'channel',
      messages: [
        {
          id: 1,
          user: 'Carol',
          text: 'Random thoughts go here.',
          timestamp: '10:00 AM',
        },
      ],
    },
    eve: {
      type: 'dm',
      messages: [
        {
          id: 1,
          user: 'You',
          text: 'Hey Eve, how are you?',
          timestamp: '11:00 AM',
        },
        {
          id: 2,
          user: 'Eve',
          text: 'I am good, thanks!',
          timestamp: '11:05 AM',
        },
      ],
    },
  });

  const [channelList, setChannelList] = useState<string[]>([
    'general',
    'random',
  ]);
  const [dmList, setDmList] = useState<string[]>(['Eve']);

  const addNewChannel = () => {
    const newChannel = 'project-updates';

    if (!channelList.includes(newChannel)) {
      setChannelList((prevChannelList) => [...prevChannelList, newChannel]);

      setChats((prevChats) => ({
        ...prevChats,
        [newChannel]: {
          type: 'channel',
          messages: [
            {
              id: 1,
              user: 'Dave',
              text: `Welcome to ${newChannel}!`,
              timestamp: '1:00 PM',
            },
          ],
        },
      }));
    }

    setActiveChat(newChannel);
  };

  const addNewDm = () => {
    const newUser = 'Frank';

    if (!dmList.includes(newUser)) {
      setDmList((prevDmList) => [...prevDmList, newUser]);

      setChats((prevChats) => ({
        ...prevChats,
        [newUser.toLowerCase()]: {
          type: 'dm',
          messages: [
            {
              id: 1,
              user: 'You',
              text: `Hello ${newUser}, welcome aboard!`,
              timestamp: '12:00 PM',
            },
            {
              id: 2,
              user: newUser,
              text: 'Thanks! Glad to be here.',
              timestamp: '12:05 PM',
            },
          ],
        },
      }));
    }

    setActiveChat(newUser.toLowerCase());
  };

  return (
    <div className={styles.messagingContainer}>
      <Sidebar
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        channelList={channelList}
        dmList={dmList}
        addNewChannel={addNewChannel}
        addNewDm={addNewDm}
        chats={chats}
      />
      <ChatArea
        messages={chats[activeChat]?.messages || []}
        chatTitle={
          chats[activeChat]?.type === 'channel'
            ? `#${activeChat}`
            : `DM with ${activeChat.charAt(0).toUpperCase() + activeChat.slice(1)}`
        }
      />
    </div>
  );
};

export default PreviewMessaging;
