'use client';

import React from 'react';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import useUserProjects from '@/hooks/dashboard/useUserProjects';
import ProtectedComponent from '../ProtectedComponent/protected-page';
import Link from 'next/link'; 

const Dashboard: React.FC = () => {
  const user = useAuthRedirect();
  const { projects, loading, error } = useUserProjects(user?.id);

  if (!user) {
    // Optionally, display a loading indicator or message while redirecting
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <ProtectedComponent />
      <h1>Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div> // Display the error message in red
      ) : projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <h2>
                <Link href={`/projects/${project.id}`}>{project.title}</Link>
              </h2>
              <p>Created at: {new Date(project.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
};

export default Dashboard;
