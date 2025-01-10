import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { projectRoles } from '@/utils/roles';

interface EditRolesProps {
  roles: string[];
  setRoles: (roles: string[]) => void;
}

const EditRoles: React.FC<EditRolesProps> = ({ roles, setRoles }) => {
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<
    string | null
  >(null);

  useEffect(() => {
    setSelectedRoles(roles);
  }, [roles]);

  const [selectedRoles, setSelectedRoles] = useState<string[]>(roles);

  const handleRoleSelection = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : selectedRoles.length < 5
        ? [...selectedRoles, role]
        : selectedRoles;

    setSelectedRoles(newRoles);
    setRoles(newRoles);
  };

  const handleRoleRemove = (role: string) => {
    const newRoles = selectedRoles.filter((r) => r !== role);
    setSelectedRoles(newRoles);
    setRoles(newRoles);
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
    <div className={styles.editRolesContainer}>
      <h2>
        <b>Edit Roles:</b>
      </h2>
      <h3 className={styles.title}>Select Roles (Limit of 5)</h3>

      <div className={styles.selectedRolesContainer}>
        {selectedRoles.map((role) => (
          <div key={role} className={styles.selectedRole}>
            {role}
            <button
              onClick={() => handleRoleRemove(role)}
              className={styles.removeRoleButton}
            >
              ×
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

export default EditRoles;
