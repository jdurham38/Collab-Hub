import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectOverview } from '@/services/IndividualProjects/overview';
import styles from './Overview.module.css';
import ProjectDescription from './Description/Description';
import ProjectTags from './Tags/Tags';
import ProjectRoles from './Roles/Roles';
import ProjectUsers from './UsersInProject/UsersInProject';

interface OverviewProps {
  projectId: string;
}

const Overview: React.FC<OverviewProps> = ({ projectId }) => {
  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['projectOverview', projectId],
    queryFn: () => getProjectOverview(projectId),
  });

  if (isLoading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        Error:{' '}
        {error instanceof Error ? error.message : 'An error occurred'}
      </div>
    );
  }

  if (!project) {
    return <div className={styles.error}>Project not found.</div>;
  }

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.tabContent}>
        <div className={styles.flexContainer}>
          <ProjectDescription description={project.description} />
          <ProjectUsers projectId={projectId} />
        </div>

        {}
        <div className={styles.flexContainer}>
          <ProjectTags tags={project.tags} />
          <ProjectRoles roles={project.roles} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
