import React, { SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import styles from './CreateProject.module.css';
import TagsSelector from './TagSelector/TagSelector';
import RolesSelector from './RolesSelector/RolesSelector';
import Description from './Description/Description';
import Title from './Title/Title';
import BannerSelector from './Banner/BannerSelector';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';

interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { isLoggedIn, session } = useAuthStore();

  // Form fields and error states
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerError, setBannerError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagsError, setTagsError] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState('');

  // Automatically clear tags and roles errors when their state changes
  useEffect(() => {
    if (tags.length > 0 && tags.length <= 5) {
      setTagsError('');
    }
  }, [tags]);

  useEffect(() => {
    if (roles.length > 0 && roles.length <= 5) {
      setRolesError('');
    }
  }, [roles]);

  // Updated set functions to clear errors on user input
  const handleSetTitle = (value: string) => {
    setTitle(value);
    if (value.trim()) setTitleError(''); // Clear error if input is non-empty
  };

  const handleSetDescription = (value: string) => {
    setDescription(value);
    if (value.trim()) setDescriptionError(''); // Clear error if input is non-empty
  };

  const handleSetBannerUrl = (url: string) => {
    setBannerUrl(url);
    setBannerError(''); // Clear error when a banner is selected
  };

  const handleSetBannerFile = (file: File | null) => {
    setBannerFile(file);
    setBannerError(''); // Clear error when a banner is uploaded
  };

  const handleSetTags = (newTags: SetStateAction<string[]>) => {
    setTags((prevTags) => (typeof newTags === 'function' ? newTags(prevTags) : newTags));
  };

  const handleSetRoles = (newRoles: SetStateAction<string[]>) => {
    setRoles((prevRoles) => (typeof newRoles === 'function' ? newRoles(prevRoles) : newRoles));
  };

  const validateFields = () => {
    let valid = true;

    // Title validation
    if (title.trim() === '') {
      setTitleError('Project title is required.');
      valid = false;
    }

    // Description validation
    if (description.trim() === '') {
      setDescriptionError('Project description is required.');
      valid = false;
    }

    // Banner validation
    if (!bannerUrl && !bannerFile) {
      setBannerError('Please select or upload a banner image for your project.');
      valid = false;
    }

    // Tags validation
    if (tags.length === 0) {
      setTagsError('Please select at least one tag.');
      valid = false;
    } else if (tags.length > 5) {
      setTagsError('You can select up to 5 tags only.');
      valid = false;
    }

    // Roles validation
    if (roles.length === 0) {
      setRolesError('Please select at least one role.');
      valid = false;
    } else if (roles.length > 5) {
      setRolesError('You can select up to 5 roles only.');
      valid = false;
    }

    return valid;
  };

  const handleCreateProject = async () => {
    if (!isLoggedIn || !session) {
      alert('You must be logged in to create a project.');
      return;
    }

    // Validate all fields before submission
    if (!validateFields()) return;

    try {
      let finalBannerUrl = bannerUrl;

      // Upload the banner file if it exists
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `custom-banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-banners')
          .upload(filePath, bannerFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('project-banners')
          .getPublicUrl(filePath);

        if (!data || !data.publicUrl) {
          throw new Error('Failed to get public URL of the uploaded image.');
        }

        finalBannerUrl = data.publicUrl;
      }

      const userId = session.user.id;

      const response = await fetch('/api/projects/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          bannerUrl: finalBannerUrl,
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

        {/* Title Input */}
        <Title title={title} setTitle={handleSetTitle} setTitleError={setTitleError} />
        {titleError && <p className={styles.error}>{titleError}</p>}

        {/* Description Input */}
        <Description description={description} setDescription={handleSetDescription} />
        {descriptionError && <p className={styles.error}>{descriptionError}</p>}

        {/* Banner Selector */}
        <BannerSelector bannerUrl={bannerUrl} setBannerUrl={handleSetBannerUrl} setBannerFile={handleSetBannerFile} />
        {bannerError && <p className={styles.error}>{bannerError}</p>}

        {/* Tags Selector */}
        <TagsSelector selectedTags={tags} setSelectedTags={handleSetTags} />
        {tagsError && <p className={styles.error}>{tagsError}</p>}

        {/* Roles Selector */}
        <RolesSelector selectedRoles={roles} setSelectedRoles={handleSetRoles} />
        {rolesError && <p className={styles.error}>{rolesError}</p>}

        {/* Create Button */}
        <button className={styles.createButton} onClick={handleCreateProject}>
          Create Project
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
