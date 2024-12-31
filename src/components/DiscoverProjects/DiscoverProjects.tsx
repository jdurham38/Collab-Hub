'use client'
import React from 'react';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import ProjectGrid from './ProjectGrid/ProjectGrid';

const DiscoverProjects: React.FC = () => {
  const user = useAuthRedirect();
  return (
    <div>
      <ProjectGrid userId={user?.id} />
    </div>
  );
};

export default DiscoverProjects;