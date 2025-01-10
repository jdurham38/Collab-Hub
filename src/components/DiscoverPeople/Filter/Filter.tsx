'use client';
import React, { useState, useEffect } from 'react';
import styles from './UserFilter.module.css';
import { projectRoles } from '@/utils/roles';

interface UserFilterProps {
  onFilterChange: (filters: {
    roles: string[];
    dateRange: string;
    searchTerm: string;
  }) => void;
  initialFilters?: { roles: string[]; dateRange: string; searchTerm: string };
}

const UserFilter: React.FC<UserFilterProps> = ({
  onFilterChange,
  initialFilters,
}) => {
  const [dateRange] = useState<string>(initialFilters?.dateRange || '');
  const [searchTerm] = useState<string>(initialFilters?.searchTerm || '');
  const [localFilters, setLocalFilters] = useState({
    roles: initialFilters?.roles || [],
    dateRange: initialFilters?.dateRange || '',
    searchTerm: initialFilters?.searchTerm || '',
  });

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoles = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      roles: selectedRoles,
    }));
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      dateRange: e.target.value,
    }));
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      searchTerm: e.target.value,
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({ roles: [], dateRange: '', searchTerm: '' });
    onFilterChange({ roles: [], dateRange: '', searchTerm: '' });
  };

  useEffect(() => {
    setLocalFilters({
      roles: initialFilters?.roles || [],
      dateRange: dateRange,
      searchTerm: searchTerm,
    });
  }, [initialFilters?.roles, dateRange, searchTerm]);

  const allRoles = Object.values(projectRoles).flat();

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGroup}>
        <h3>Role Filter</h3>
        <select
          multiple
          value={localFilters.roles}
          onChange={handleRoleChange}
          className={styles.roleSelect}
        >
          {allRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <h3>Date Range Filter</h3>
        <select value={localFilters.dateRange} onChange={handleDateRangeChange}>
          <option value="">All Time</option>
          <option value="last7Days">Last 7 Days</option>
          <option value="last30Days">Last 30 Days</option>
          <option value="lastYear">Last Year</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <h3>Search Users</h3>
        <input
          type="text"
          placeholder="Search users..."
          value={localFilters.searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>
      <div className={styles.filterButtonContainer}>
        <button onClick={handleApplyFilters} className={styles.applyButton}>
          Apply Filters
        </button>
        <button onClick={handleClearFilters} className={styles.clearButton}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default UserFilter;
