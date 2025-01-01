// --- components/Filter/Filter.tsx ---
import React, { useState } from 'react';
import styles from './Filter.module.css';
import MultiSelectDropdown from './MultiSelectDropDown/MultiSelectDropDown';
import { projectRoles } from '@/utils/roles';
import { projectTags } from '@/utils/tags';
import Dropdown from './Dropdown/Dropdown';
import ProjectSearch from './Search/Search';

interface DropdownOption {
  label: string;
  value: string;
}

interface ProjectFilterProps {
  onFilterChange: (
    filters: {
      tags: string[];
      roles: string[];
      dateRange: string;
    },
    searchTerm: string
  ) => void;
}


const ProjectFilter: React.FC<ProjectFilterProps> = ({ onFilterChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allTags = Object.values(projectTags).flat();
  const allRoles = Object.values(projectRoles).flat();

  const dateRangeOptions: DropdownOption[] = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
  ];

    const handleSearch = (term: string) => {
      setSearchTerm(term);
        onFilterChange({tags: selectedTags, roles: selectedRoles, dateRange: selectedDateRange}, term);
    };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedRoles([]);
    setSelectedDateRange('all');
    setSearchTerm('');
       onFilterChange({tags: [], roles: [], dateRange: 'all'}, '');
  };

  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);
        onFilterChange({tags: selectedTags, roles: selectedRoles, dateRange: value}, searchTerm);
  };

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
      onFilterChange({tags: tags, roles: selectedRoles, dateRange: selectedDateRange}, searchTerm);
  };

  const handleRoleSelect = (roles: string[]) => {
    setSelectedRoles(roles);
        onFilterChange({tags: selectedTags, roles: roles, dateRange: selectedDateRange}, searchTerm);
  };


  return (
    <div className={styles.filterContainer}>
      <ProjectSearch onSearch={handleSearch} />
      <div className={styles.filterSection}>
        <MultiSelectDropdown
          label="Select Tags"
          options={allTags}
          selected={selectedTags}
          onSelect={handleTagSelect}
        />
      </div>
      <div className={styles.filterSection}>
        <MultiSelectDropdown
          label="Select Roles"
          options={allRoles}
          selected={selectedRoles}
          onSelect={handleRoleSelect}
        />
      </div>
      <div className={styles.filterSection}>
        <Dropdown
          label="Date Range"
          options={dateRangeOptions}
          selected={selectedDateRange}
          onSelect={handleDateRangeChange}
        />
      </div>
      <button onClick={handleClearFilters} className={styles.clearButton}>
        Clear Filters
      </button>
    </div>
  );
};

export default ProjectFilter;