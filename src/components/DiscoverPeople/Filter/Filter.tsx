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


  const handleRoleChange = (role: string) => {
    setLocalFilters((prevFilters) => {
      const roles = [...prevFilters.roles];
      if (roles.includes(role)) {
        return {
          ...prevFilters,
          roles: roles.filter((r) => r !== role),
        };
      } else {
        return {
          ...prevFilters,
          roles: [...roles, role],
        };
      }
    });
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
      <div className={styles.filterGroup}>
        <h3>Search Users</h3>
        <input
          type="text"
          placeholder="Search users..."
          value={localFilters.searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>
        <h3>Date User Created At</h3>
        <select value={localFilters.dateRange} onChange={handleDateRangeChange}>
          <option value="">All Time</option>
          <option value="last7Days">Last 7 Days</option>
          <option value="last30Days">Last 30 Days</option>
          <option value="lastYear">Last Year</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <h3>Roles</h3>
           <div className={styles.dropdownContent}>
                <div className={styles.scrollableContent}>
                {allRoles.map((role) => (
                    <label key={role} className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            value={role}
                            checked={localFilters.roles.includes(role)}
                            onChange={() => handleRoleChange(role)}
                        />
                        {role}
                    </label>
                ))}
            </div>
            </div>
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