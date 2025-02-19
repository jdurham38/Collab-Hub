import { useEffect, useState } from 'react';
import { getUserProjects } from '@/services/Dashboard/getUserProjects';

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

const useUserProjects = (userId: string | undefined) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserProjects = async () => {
      try {
        const userProjectData = await getUserProjects(userId);
        setProjects(userProjectData);
        setError(null);
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

export default useUserProjects;
