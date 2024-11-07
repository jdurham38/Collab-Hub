'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore'; // Adjust the import as necessary
import { projectRoles } from '@/utils/roles';
import { projectTags } from '@/utils/tags'; // Import roles and tags from constants
import styles from './CreateProject.module.css';

interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {  const router = useRouter();
  const { isLoggedIn, session } = useAuthStore(); // Get session from useAuthStore
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  // Handle form submission
  const handleCreateProject = async () => {
    if (!isLoggedIn || !session) {
      alert('You must be logged in to create a project.');
      return;
    }
  
    try {
      const userId = session.user.id;
  
      const response = await fetch('/api/projects/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          banner,
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
  
  

  // Handle tag and role selection
  const handleTagSelection = (tag: string) => {
    setTags((prevTags) =>
      prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
    );
  };

  const handleRoleSelection = (role: string) => {
    setRoles((prevRoles) =>
      prevRoles.includes(role) ? prevRoles.filter((r) => r !== role) : [...prevRoles, role]
    );
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
        <input
          type="text"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />

        <h3>Select a Banner</h3>
        <div className={styles.bannerOptions}>
          <button className={styles.bannerButton} onClick={() => setBanner('banner1.jpg')}>Banner 1</button>
          <button className={styles.bannerButton} onClick={() => setBanner('banner2.jpg')}>Banner 2</button>
          <button className={styles.bannerButton} onClick={() => setBanner('banner3.jpg')}>Banner 3</button>
        </div>

        <h3>Select Tags</h3>
        <div className={styles.tagsContainer}>
          {projectTags.map((tag) => (
            <button
              key={tag}
              className={`${styles.tagButton} ${tags.includes(tag) ? styles.selected : ''}`}
              onClick={() => handleTagSelection(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <h3>Select Roles Needed</h3>
        <div className={styles.rolesContainer}>
          {projectRoles.map((role) => (
            <button
              key={role}
              className={`${styles.roleButton} ${roles.includes(role) ? styles.selected : ''}`}
              onClick={() => handleRoleSelection(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <button className={styles.createButton} onClick={handleCreateProject}>
          Create Project
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
