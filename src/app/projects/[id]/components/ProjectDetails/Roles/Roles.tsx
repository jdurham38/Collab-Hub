import React from 'react';
import styles from './Roles.module.css';

interface ProjectRolesProps {
  roles: string[];
}

const ProjectRoles: React.FC<ProjectRolesProps> = ({ roles }) => (
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

export default ProjectRoles;
