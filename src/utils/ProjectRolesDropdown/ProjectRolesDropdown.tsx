import React, { useState, useCallback } from 'react';
import { projectRoles } from '../roles';
import styles from './Dropdown.module.css';

interface ProjectRolesDropdownProps {
  onChange: (value: string) => void;
  value?: string;
  disabled?: boolean;
}

const ProjectRolesDropdown: React.FC<ProjectRolesDropdownProps> = ({
  onChange,
  value,
  disabled,
}) => {
  const [selectedValue, setSelectedValue] = useState(value || '');

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      setSelectedValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.dropdownContainer}>
        <label className={styles.label} htmlFor="role">
          Role
        </label>
        <select
          className={styles.dropdown}
          value={selectedValue}
          id="role"
          onChange={handleSelectChange}
          disabled={disabled}
        >
          <option value="" disabled>
            Select a role
          </option>
          {Object.entries(projectRoles).map(([category, roles]) => (
            <optgroup key={category} label={category}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProjectRolesDropdown;
