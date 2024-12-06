import React from 'react';
import styles from './Users.module.css';



const ProjectUsers: React.FC = () => {


  return (
    <div className={styles.userContainer}>
      <h2>Project Users</h2>

      <div className={styles.ownerSection}>
        <h3>Owner</h3>
            <p>You the most amazing project owner ever !!!</p>
      </div>

      <div className={styles.collaboratorsSection}>
        <h3>Collaborators</h3>
            <p>Your amazing project collaborators</p>
      </div>
    </div>
  );
};

export default ProjectUsers;
