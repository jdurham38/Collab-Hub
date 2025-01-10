import React from 'react';
import { User } from '@/utils/interfaces';

interface UserListItemProps {
  user: User;
  isActive: boolean;
  onClick: (user: User) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isActive,
  onClick,
}) => {
  return (
    <li
      className={`user-list-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(user)}
    >
      {}
      <span className="user-name">{user.username}</span>
      {}
    </li>
  );
};

export default UserListItem;
