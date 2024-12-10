// src/components/UserListItem/UserListItem.tsx

import React from 'react';
import { User } from '@/utils/interfaces';

interface UserListItemProps {
  user: User;
  isActive: boolean;
  onClick: (user: User) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, isActive, onClick }) => {
  return (
    <li
      className={`user-list-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(user)}
    >
      {/* Display user's avatar/profile picture here if you have it */}
      <span className="user-name">{user.username}</span>
      {/* You can add an unread message indicator here if needed */}
    </li>
  );
};

export default UserListItem;