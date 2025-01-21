'use client';
import React, { useState, useEffect } from 'react';
import styles from './overlay.module.css';
import projectInviteService from '@/services/ProjectInvite/projectInviteService';
import { Project, User } from '@/utils/interfaces';
import Loader from '@/components/Loader/Loader';
import { toast } from 'react-toastify';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import { getCreatorProjects } from '@/services/ProjectInvite/fetchProjects';
import projectInviteFetchService from '@/services/ProjectInvite/projectInviteFetchService'

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
    const [collaboratorProjects, setCollaboratorProjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [invitedProjects, setInvitedProjects] = useState<string[]>([]); // Track invited projects
  const user: User | null = useAuthRedirect();

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            if (!user?.id) {
                setLoading(false);
                setError('User session not found');
                return;
            }
            try {
                const [projectsData, existingInvites, collaboratorIds] = await Promise.all([
                    getCreatorProjects(user.id),
                     projectInviteFetchService.getProjectInvites({ user_id: receiverId }), // Fetch existing invites using new service
                    projectInviteFetchService.getProjectCollaborators(receiverId)
                ]);

                setProjects(projectsData);

                // Extract the project ids from the invites where the user is a receiver
                const projectIdsWithInvites = existingInvites
                    .filter(invite => invite.receiver_id === receiverId)
                    .map((invite) => invite.project_id);

                setInvitedProjects(projectIdsWithInvites); // Set the invited projects
                setCollaboratorProjects(collaboratorIds);
            } catch (e) {
                let errorMessage = 'An unexpected error occurred.';
                if (e instanceof Error) {
                    errorMessage =
                        e.message || 'An error occurred while fetching data.';
                } else if (typeof e === 'string') {
                    errorMessage = e;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user, receiverId]);

  const handleCheckboxChange = (projectId: string) => {
    if(invitedProjects.includes(projectId) || collaboratorProjects.includes(projectId)){
        return;
      }
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
          setSelectedProjects([]);
          // After creating the invites update the state.
          setInvitedProjects(prev => [...prev, ...selectedProjects]);
    } catch (error) {
        if(error instanceof Error && error.message.includes('already exists for this user in this project')){
            toast.error('User is already in project')
            return;
        }
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
                <label
                    className={collaboratorProjects.includes(project.id) ? styles.collaborator : invitedProjects.includes(project.id) ? styles.invited : ''}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleCheckboxChange(project.id)}
                      disabled={invitedProjects.includes(project.id) || collaboratorProjects.includes(project.id)}
                  />
                  {project.title}
                    {invitedProjects.includes(project.id) && (
                        <span className={styles.invitedText}> (Invited)</span>
                    )}
                     {collaboratorProjects.includes(project.id) && (
                         <span className={styles.collaboratorText}> (In Project)</span>
                     )}
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