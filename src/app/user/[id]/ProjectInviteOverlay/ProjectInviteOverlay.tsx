'use client';
import React, { useState, useEffect } from 'react';
import styles from './overlay.module.css';
import projectInviteService from '@/services/ProjectInvite/projectInviteService';
import { Project, User } from '@/utils/interfaces';
import Loader from '@/components/Loader/Loader';
import { toast } from 'react-toastify';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import { getCreatorProjects } from '@/services/ProjectInvite/fetchProjects';

interface ProjectInviteOverlayProps {
  receiverId: string;
  onClose: () => void;
}

const ProjectInviteOverlay: React.FC<ProjectInviteOverlayProps> = ({
  receiverId,
  onClose,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const user: User | null = useAuthRedirect();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      if (!user?.id) {
        setLoading(false);
        setError('User session not found');
        return;
      }
      try {
        const projectsData = await getCreatorProjects(user.id);

        setProjects(projectsData);
      } catch (e) {
        let errorMessage = 'An unexpected error occurred.';
        if (e instanceof Error) {
          errorMessage =
            e.message || 'An error occurred while fetching projects.';
        } else if (typeof e === 'string') {
          errorMessage = e;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleCheckboxChange = (projectId: string) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId],
    );
  };

  const handleInvite = async () => {
    if (!user?.id) {
      toast.error('User session not found');
      return;
    }

    if (selectedProjects.length === 0) {
      toast.error('Please select at least one project to invite the user to.');
      return;
    }
    try {
      await Promise.all(
        selectedProjects.map(async (projectId) => {
          await projectInviteService.createProjectInvite(
            projectId,
            receiverId,
            user.id,
          );
        }),
      );
      toast.success('Invites sent successfully!');
      onClose();
    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage =
          error.message || 'An error occurred while sending the invite.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>
        <h2>Invite to Project</h2>
        {projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <ul className={styles.projectList}>
            {projects.map((project) => (
              <li key={project.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleCheckboxChange(project.id)}
                  />
                  {project.title}
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.buttonGroup}>
          <button className={styles.inviteButton} onClick={handleInvite}>
            Send Invite
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInviteOverlay;
