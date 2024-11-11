// CreateProject.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import styles from './CreateProject.module.css';
import TagsSelector from './TagSelector/TagSelector';
import RolesSelector from './RolesSelector/RolesSelector';
import Description from './Description/Description';
import Title from './Title/Title'; // Import the new Title component
import BannerSelector from './Banner/BannerSelector';

interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {
  const router = useRouter();
  const { isLoggedIn, session } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Rich text content (HTML)
  const [bannerUrl, setBannerUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [titleError, setTitleError] = useState('');

  const handleCreateProject = async () => {
    if (!isLoggedIn || !session) {
      alert('You must be logged in to create a project.');
      return;
    }

    // Check for errors before submitting
    if (title.trim() === '') {
      alert('Please enter a project title.');
      return;
    }

    if (titleError !== '') {
      alert('Please fix the errors in the project title.');
      return;
    }
    if (!bannerUrl) {
      alert('Please select or upload a banner image for your project.');
      return;
    }
    

    try {
      const userId = session.user.id;

      const response = await fetch('/api/projects/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description, // Now contains HTML content
          bannerUrl,
          tags,
          roles,
          userId,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to create project');
      }

      const { projectId } = await response.json();
      alert('Project created successfully!');
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <div className={styles.createProjectModal}>
      <div className={styles.createProjectContent}>
        <div className={styles.modalHeader}>
          <h1 className={styles.modalTitle}>Create a New Project</h1>
          <button className={styles.closeButton} onClick={onClose}>
            {'\u00D7'}
          </button>
        </div>

        {/* Use Title Component */}
        <Title title={title} setTitle={setTitle} setTitleError={setTitleError} />
        {/* Use Description Component */}
        <Description description={description} setDescription={setDescription} />

        <h3>Select a Banner</h3>
               {/* Use BannerSelector Component */}
        <BannerSelector bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} />


        {/* Use TagsSelector Component */}
        <TagsSelector selectedTags={tags} setSelectedTags={setTags} />

        {/* Use RolesSelector Component */}
        <RolesSelector selectedRoles={roles} setSelectedRoles={setRoles} />

        <button
          className={styles.createButton}
          onClick={handleCreateProject}
          disabled={
            titleError !== '' ||
            title.trim() === '' ||
            !bannerUrl // Disable if bannerUrl is empty
          }
        >
          Create Project
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
