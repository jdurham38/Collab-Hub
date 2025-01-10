import React from 'react';
import styles from './MessageList.module.css';
import MessageItem from './MessageItem';
import DateSeperator from '../DateSeperator/DateSeperator';
import { Message, User } from '@/utils/interfaces';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  userMap: { [key: string]: User };
}

const MessageList: React.FC<MessageListProps> = ({
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
    <div className={styles.messageList}>
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
            {showDateSeparator && <DateSeperator date={messageDate} />}
            <MessageItem
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

export default MessageList;
