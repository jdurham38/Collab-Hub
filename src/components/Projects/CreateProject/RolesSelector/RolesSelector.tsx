import React, { useState } from 'react';
import styles from './RolesSelector.module.css';
import { projectRoles } from '@/utils/roles';

interface RolesSelectorProps {
  selectedRoles: string[];
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>;
}

const RolesSelector: React.FC<RolesSelectorProps> = ({ selectedRoles, setSelectedRoles }) => {
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string | null>(null);

  const handleRoleSelection = (role: string) => {
    setSelectedRoles((prevRoles) => {
      // If the role is already selected, remove it
      if (prevRoles.includes(role)) {
        return prevRoles.filter((r) => r !== role);
      }
      // If the user tries to add a role and has already selected 5 roles, do nothing
      if (prevRoles.length >= 5) {
        alert('You can only select up to 5 roles.');
        return prevRoles;
      }
      // Otherwise, add the role without modifying the search input
      return [...prevRoles, role];
    });
  };

  const handleRoleRemove = (role: string) => {
    setSelectedRoles((prevRoles) => prevRoles.filter((r) => r !== role));
  };

  const filteredRoles = Object.entries(projectRoles).flatMap(([category, rolesList]) =>
    selectedRoleCategory && selectedRoleCategory !== category
      ? []
      : (rolesList as string[])
          .filter((role: string) => role.toLowerCase().includes(roleSearch.toLowerCase()))
          .map((role) => ({ category, role }))
  );

  return (
    <div>
      <h3>Select Roles Needed (Limit of 5)</h3>

      {/* Selected roles container */}
      <div className={styles.selectedRolesContainer}>
        {selectedRoles.map((role) => (
          <div key={role} className={styles.selectedRole}>
            {role}
            <button onClick={() => handleRoleRemove(role)} className={styles.removeRoleButton}>
              &times;
            </button>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search roles"
        value={roleSearch}
        onChange={(e) => setRoleSearch(e.target.value)}
        className={styles.searchInput}
      />

      <select
        onChange={(e) => setSelectedRoleCategory(e.target.value || null)}
        className={styles.categorySelect}
      >
        <option value="">All Categories</option>
        {Object.keys(projectRoles).map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Filtered roles for selection */}
      <div className={styles.rolesContainer}>
        {filteredRoles.map(({ category, role }) => (
          <label key={`${category}-${role}`} className={styles.roleCheckboxLabel}>
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleSelection(role)}
              disabled={!selectedRoles.includes(role) && selectedRoles.length >= 5} // Disable if max roles reached
            />
            {role} <span className={styles.roleCategoryLabel}>({category})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolesSelector;
