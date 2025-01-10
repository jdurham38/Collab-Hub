import React, { useState } from 'react';
import styles from './RolesSelector.module.css';
import { projectRoles } from '@/utils/roles';

interface RolesSelectorProps {
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
}

const RolesSelector: React.FC<RolesSelectorProps> = ({
  selectedRoles,
  setSelectedRoles,
}) => {
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<
    string | null
  >(null);

  const handleRoleSelection = (role: string) => {
    if (selectedRoles.includes(role)) {
      const newRoles = selectedRoles.filter((r) => r !== role);
      setSelectedRoles(newRoles);
    } else {
      if (selectedRoles.length >= 5) {
        alert('You can only select up to 5 roles.');
        return;
      }
      const newRoles = [...selectedRoles, role];
      setSelectedRoles(newRoles);
    }
  };

  const handleRoleRemove = (role: string) => {
    const newRoles = selectedRoles.filter((r) => r !== role);
    setSelectedRoles(newRoles);
  };

  const filteredRoles = Object.entries(projectRoles).flatMap(
    ([category, rolesList]) =>
      selectedRoleCategory && selectedRoleCategory !== category
        ? []
        : (rolesList as string[])
            .filter((role) =>
              role.toLowerCase().includes(roleSearch.toLowerCase()),
            )
            .map((role) => ({ category, role })),
  );

  return (
    <div>
      <h3 className={styles.title}>Select Roles Needed (Limit of 5)</h3>

      {}
      <div className={styles.selectedRolesContainer}>
        {selectedRoles.map((role) => (
          <div key={role} className={styles.selectedRole}>
            {role}
            <button
              onClick={() => handleRoleRemove(role)}
              className={styles.removeRoleButton}
            >
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

      {}
      <div className={styles.rolesContainer}>
        {filteredRoles.map(({ category, role }) => (
          <label
            key={`${category}-${role}`}
            className={styles.roleCheckboxLabel}
          >
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleSelection(role)}
              disabled={
                !selectedRoles.includes(role) && selectedRoles.length >= 5
              }
            />
            {role}{' '}
            <span className={styles.roleCategoryLabel}>({category})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolesSelector;
