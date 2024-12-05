import { useState, useEffect } from 'react';
import { getBanner } from '@/services/IndividualProjects/overview';
import { Project } from '@/utils/interfaces';

interface UseProjectDataReturn {
  project: Project | null;
  loading: boolean;
  error: string | null;
}

const useProjectData = (projectId: string): UseProjectDataReturn => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const projectData = await getBanner(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};

export default useProjectData;
