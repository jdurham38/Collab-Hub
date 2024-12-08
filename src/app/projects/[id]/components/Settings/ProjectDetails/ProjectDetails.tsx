import React, { useState, useEffect } from 'react';
import {
  fetchProjectDetails,
  updateProjectDetails,
} from '@/services/ProjectSettings/editProjectDetails';
import { Project } from '@/utils/interfaces';
import EditTitle from '../ProjectDetails/EditTitle';
import EditDescription from '../ProjectDetails/EditDescription';
import EditTags from '../ProjectDetails/EditTags';
import EditRoles from '../ProjectDetails/EditRoles';
import EditBanner from '../ProjectDetails/EditBanner';
import styles from './ProjectDetails.module.css';
interface EditProjectProps {
  projectId: string;
}

const ProjectDetails: React.FC<EditProjectProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New state for success

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!projectId) return;

      try {
        const fetchedProject = await fetchProjectDetails(projectId);
        setProject(fetchedProject);
        setTitle(fetchedProject.title);
        setDescription(fetchedProject.description);
        setBannerUrl(fetchedProject.banner_url || '');
        setTags(fetchedProject.tags || []);
        setRoles(fetchedProject.roles || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch project details.');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectDetails();
  }, [projectId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null); // Reset success message

    try {
      await updateProjectDetails(projectId, {
        title,
        description,
        banner_url: bannerUrl,
        tags,
        roles,
      });

      // Option 1: Full Page Reload
      window.location.reload();

      // Option 2: Update Local State Without Reload
      // Uncomment the lines below if you prefer to update the state instead of reloading
      /*
      const updatedProject = await fetchProjectDetails(projectId);
      setProject(updatedProject);
      setTitle(updatedProject.title);
      setDescription(updatedProject.description);
      setBannerUrl(updatedProject.banner_url || '');
      setTags(updatedProject.tags || []);
      setRoles(updatedProject.roles || []);
      setSuccessMessage('Project updated successfully!');
      */
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className={styles.projectDetailsContainer}>
      <h1>Edit Project: {project.title}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <EditTitle title={title} setTitle={setTitle} />
        <EditDescription description={description} setDescription={setDescription} />
        <EditBanner
          bannerUrl={bannerUrl}
          setBannerUrl={setBannerUrl}
          setBannerFile={setBannerFile}
        />
        <EditTags tags={tags} setTags={setTags} />
        <EditRoles roles={roles} setRoles={setRoles} />

        {successMessage && <div className={styles.success}>{successMessage}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? 'Updating...' : 'Update Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectDetails;
