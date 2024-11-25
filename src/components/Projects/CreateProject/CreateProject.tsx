// CreateProject.tsx

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './CreateProject.module.css';
import TagsSelector from './TagSelector/TagSelector';
import RolesSelector from './RolesSelector/RolesSelector';
import Description from './Description/Description';
import Title from './Title/Title';
import BannerSelector from './Banner/BannerSelector';
import PreviewProject from '../PreviewProject/PreviewProject';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import { useProjectStore } from '@/store/useProjectStore';
import { uploadBanner, createProject } from '@/services/createProjectServices';

interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { isLoggedIn, session } = useAuthStore();

  // Use project store for shared state
  const {
    title,
    description,
    tags,
    roles,
    setTitle,
    setDescription,
    setTags,
    setRoles,
    resetProject,
  } = useProjectStore();

  // Local state for banner
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for error messages
  const [errors, setErrors] = useState({
    titleError: '',
    descriptionError: '',
    bannerError: '',
    tagsError: '',
    rolesError: '',
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const validateFields = () => {
    const newErrors = {
      titleError: title?.trim() ? '' : 'Project title is required.',
      descriptionError: description?.trim()
        ? ''
        : 'Project description is required.',
      bannerError:
        bannerUrl || bannerFile
          ? ''
          : 'Please select or upload a banner image for your project.',
      tagsError:
        tags.length === 0
          ? 'Please select at least one tag.'
          : tags.length > 5
          ? 'You can select up to 5 tags only.'
          : '',
      rolesError:
        roles.length === 0
          ? 'Please select at least one role.'
          : roles.length > 5
          ? 'You can select up to 5 roles only.'
          : '',
    };
  
    setErrors(newErrors);
  
    // Return true if there are no errors
    return Object.values(newErrors).every((error) => !error);
  };

  // Function to handle closing and resetting the form
    const handleClose = () => {
      // Reset the global store
      resetProject();
      // Reset local state
      setBannerUrl('');
      setBannerFile(null);
      // Clear errors
      setErrors({
        titleError: '',
        descriptionError: '',
        bannerError: '',
        tagsError: '',
        rolesError: '',
      });
      // Close the modal
      onClose();
    };

  
  // Handle project creation
  const handleCreateProject = async () => {
    if (!isLoggedIn || !session) {
      toast.error('You must be logged in to create a project.');
      return;
    }

    if (!validateFields()) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      let finalBannerUrl = bannerUrl;

      if (bannerFile) {
        finalBannerUrl = await uploadBanner(supabase, bannerFile);
      }

      const projectId = await createProject({
        title,
        description,
        bannerUrl: finalBannerUrl,
        tags,
        roles,
        userId: session.user.id,
      });

      resetProject();
      router.push(`/projects/${projectId}`);
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside the modal to close it
  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  const handlePreviewClick = () => {
    if (!validateFields()) {
      toast.error('Please fill out all required fields.');
      return;
    }
    setShowPreview(true);
  };

  // Handlers to clear errors on input change
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setErrors((prevErrors) => ({ ...prevErrors, titleError: '' }));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setErrors((prevErrors) => ({ ...prevErrors, descriptionError: '' }));
  };

  const handleSetBannerUrl = (url: string) => {
    setBannerUrl(url);
    setErrors((prevErrors) => ({ ...prevErrors, bannerError: '' }));
  };

  const handleSetBannerFile = (file: File | null) => {
    setBannerFile(file);
    setErrors((prevErrors) => ({ ...prevErrors, bannerError: '' }));
  };

  const handleSetTags = (selectedTags: string[]) => {
    setTags(selectedTags);
    setErrors((prevErrors) => ({ ...prevErrors, tagsError: '' }));
  };

  const handleSetRoles = (selectedRoles: string[]) => {
    setRoles(selectedRoles);
    setErrors((prevErrors) => ({ ...prevErrors, rolesError: '' }));
  };

  return showPreview ? (
    <PreviewProject
      onClosePreview={() => setShowPreview(false)}
      onCreateProject={handleCreateProject}
      bannerUrl={bannerUrl} // Pass bannerUrl to PreviewProject
    />
  ) : (
    <div className={styles.overlay} onClick={handleClickOutside}>
      <div
        className={styles.createProjectModal}
        ref={modalRef}
        onClick={(event) => event.stopPropagation()} // Prevent bubbling
      >
        <div className={styles.createProjectContent}>
          <div className={styles.modalHeader}>
            <h1>Create a New Project</h1>
            <button className={styles.closeButton} onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className={styles.inputContainer}>
            <Title title={title} setTitle={handleTitleChange} />
            {errors.titleError && <p className={styles.error}>{errors.titleError}</p>}
          </div>
          <div className={styles.inputContainer}>
            <Description
              description={description}
              setDescription={handleDescriptionChange}
            />
            {errors.descriptionError && (
              <p className={styles.error}>{errors.descriptionError}</p>
            )}
          </div>
          <div className={styles.inputContainer}>
            <BannerSelector
              bannerUrl={bannerUrl}
              setBannerUrl={handleSetBannerUrl}
              setBannerFile={handleSetBannerFile}
            />
            {errors.bannerError && (
              <p className={styles.error}>{errors.bannerError}</p>
            )}
          </div>
          <div className={styles.inputContainer}>
            <TagsSelector selectedTags={tags} setSelectedTags={handleSetTags} />
            {errors.tagsError && <p className={styles.error}>{errors.tagsError}</p>}
          </div>
          <div className={styles.inputContainer}>
            <RolesSelector selectedRoles={roles} setSelectedRoles={handleSetRoles} />
            {errors.rolesError && (
              <p className={styles.error}>{errors.rolesError}</p>
            )}
          </div>
          <button
            onClick={handlePreviewClick}
            disabled={loading}
            className={styles.previewButton}
          >
            Preview Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
