'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedComponent from '../ProtectedComponent/protected-page';
import Link from 'next/link'; 
interface Project {
  id: string;
  title: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetchedProjects, setHasFetchedProjects] = useState(false);

    useEffect(() => {
    if (!user) {
      router.push('/');     }
  }, [user, router]);

  useEffect(() => {
    console.log('Dashboard component rendered');

    if (!user?.id || hasFetchedProjects) return;

    const fetchUserProjects = async () => {
      console.log('Fetching user projects...');

      try {
        const response = await fetch(`/api/projects/user-projects?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
        setHasFetchedProjects(true);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [user?.id, hasFetchedProjects]); 
  if (!user) {
    return null;   }

  return (
    <div>
      <ProtectedComponent />
      <h1>Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {projects.length > 0 ? (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <h2>
                    {/* Wrap project.title with Link */}
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
      )}
    </div>
  );
};

export default Dashboard;
