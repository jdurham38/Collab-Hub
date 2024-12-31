import { Project } from '@/utils/interfaces'; 


export const fetchProjectDetails = async (
  projectId: string
): Promise<Project> => {
  const response = await fetch(`/api/projects/${projectId}/editProject`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch project details');
  }
  return await response.json();
};


export const updateProjectDetails = async (
  projectId: string,
  projectData: Partial<Project>
): Promise<void> => {
  const response = await fetch(`/api/projects/${projectId}/editProject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update project details');
  }
};