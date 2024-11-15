import React from 'react';
import styles from './PreviewRoles.module.css';

interface PreviewRolesProps {
  roles: string[];
}

const PreviewRoles: React.FC<PreviewRolesProps> = ({ roles }) => (
  <div className={styles.rolesContainer}>
    <h2>Roles Required: </h2>
    <div className={styles.rolesList}>
      {roles.map((role) => (
        <span key={role} className={styles.role}>
          {role}
        </span>
      ))}
    </div>
  </div>
);

export default PreviewRoles;
