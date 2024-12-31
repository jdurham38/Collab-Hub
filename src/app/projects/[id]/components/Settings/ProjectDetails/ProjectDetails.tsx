'use client';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const fetchedProject = await fetchProjectDetails(projectId);
        setProject(fetchedProject);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to fetch project details.");
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [projectId]);




  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!project) return; 

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      
      const updatedProject: Project = {
        ...project, 
        title: project.title,
        description: project.description,
        banner_url: project.banner_url,
        tags: project.tags,
        roles: project.roles,
      };

      await updateProjectDetails(projectId, updatedProject); 


      setProject(updatedProject);
      setSuccessMessage('Project updated successfully!');



    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error("Error updating project details:", err);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
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
      <h1 className={styles.title}>Edit Project Details: {project.title}</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <EditTitle title={project.title} setTitle={(newTitle) => setProject({...project, title: newTitle})} /> {}
        <EditDescription description={project.description} setDescription={(newDescription) => setProject({...project, description: newDescription})} /> {}
        <EditBanner
          bannerUrl={project.banner_url}
          setBannerFile={setBannerFile}
          setBannerUrl={(newBannerUrl) => setProject({...project, banner_url: newBannerUrl})}

        />
        <EditTags tags={project.tags || []} setTags={(newTags) => setProject({...project, tags: newTags})} /> {}
        <EditRoles roles={project.roles || []} setRoles={(newRoles) => setProject({...project, roles: newRoles})} /> {}

          {successMessage && (
              <div className={styles.success}>{successMessage}</div>
          )}

          {error && (
              <div className={styles.error}>{error}</div>
          )}


        <button type="submit" disabled={saving} className={styles.submitButton}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

      </form>
    </div>
  );
};

export default ProjectDetails;