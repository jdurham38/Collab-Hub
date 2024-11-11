// RolesSelector.tsx
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
    setSelectedRoles((prevRoles) =>
      prevRoles.includes(role) ? prevRoles.filter((r) => r !== role) : [...prevRoles, role]
    );
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
      <h3>Select Roles Needed</h3>
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
      <div className={styles.rolesContainer}>
        {filteredRoles.map(({ category, role }) => (
          <label key={`${category}-${role}`} className={styles.roleCheckboxLabel}>
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleSelection(role)}
            />
            {role} <span className={styles.roleCategoryLabel}>({category})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolesSelector;
