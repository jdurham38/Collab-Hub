import { useEffect, useState } from 'react';
import { fetchAllUserProjects } from '@/services/DiscoverProjects/fetchProject';

export interface Project {
  id: string;
  title: string;
  description: string;
  banner_url: string;
  tags: string[];
  roles: string[];
  createdAt: string;
  created_by: string;
  created_by_username: string;

}

const useAllProjects = (userId: string | undefined) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Initialize as null

  useEffect(() => {
    console.log("userId in useAllProjects useEffect:", userId); 
    if (!userId) {
      setLoading(false); // No user ID means no projects to fetch
      return;
    }

    const fetchUserProjects = async () => {
      console.log('Fetching user projects...');

      try {
        const userProjectData = await fetchAllUserProjects(userId);
        setProjects(userProjectData);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId]);

  return { projects, loading, error };
};

export default useAllProjects;
