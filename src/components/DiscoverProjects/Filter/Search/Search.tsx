import React, { useState } from 'react';
import styles from './Search.module.css';

interface ProjectSearchProps {
  onSearch: (searchTerm: string) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm);
  };

  return (
    <input
      type="text"
      placeholder="Search Projects..."
      className={styles.searchInput}
      value={searchTerm}
      onChange={handleSearchChange}
    />
  );
};

export default ProjectSearch;
