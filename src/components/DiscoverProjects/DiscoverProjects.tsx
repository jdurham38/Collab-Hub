import React from 'react';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import ProjectGrid from './ProjectGrid/ProjectGrid';

const DiscoverProjects: React.FC = () => {
    console.log('DiscoverProjects component is rendering');
  const user = useAuthRedirect();
  console.log("userId on Discover Projects: ", user?.id)
  return (
    <div>
      <ProjectGrid userId={user?.id} />
    </div>
  );
};

export default DiscoverProjects;