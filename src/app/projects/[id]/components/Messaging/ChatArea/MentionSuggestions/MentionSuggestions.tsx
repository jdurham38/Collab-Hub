import React from 'react';
import styles from './MentionSuggestions.module.css';
import { User } from '@/utils/interfaces';

interface MentionSuggestionsProps {
  suggestions: User[];
  onSelect: (user: User) => void;
}

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  suggestions,
  onSelect,
}) => {
  return (
    <ul className={styles.suggestions}>
      {suggestions.map((user) => (
        <li
          key={user.id}
          onClick={() => onSelect(user)}
          className={styles.suggestionItem}
        >
          {user.username || user.email}
        </li>
      ))}
    </ul>
  );
};

export default MentionSuggestions;
