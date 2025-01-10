import React from 'react';
import styles from './DirectMessageList.module.css';
import DirectMessageItem from './DirectMessageItem';
import DateSeparator from '../DateSeperator/DateSeperator';
import { DirectMessage, User } from '@/utils/interfaces';

interface DirectMessageListProps {
  messages: DirectMessage[];
  currentUser: User;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  userMap: { [key: string]: User };
}

const DirectMessageList: React.FC<DirectMessageListProps> = ({
  messages,
  currentUser,
  onEdit,
  onDelete,
  userMap,
}) => {
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let lastMessageDate: string | null = null;

  return (
    <div className={styles.directMessageList}>
      {sortedMessages.map((message) => {
        const messageDate = new Date(message.timestamp);
        const messageDateString = messageDate.toDateString();

        let showDateSeparator = false;
        if (messageDateString !== lastMessageDate) {
          showDateSeparator = true;
          lastMessageDate = messageDateString;
        }

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && <DateSeparator date={messageDate} />}
            <DirectMessageItem
              message={message}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              userMap={userMap}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DirectMessageList;
