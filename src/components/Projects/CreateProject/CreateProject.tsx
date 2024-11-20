import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
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
import { useProjectStore } from '@/utils/useProjectStore';
import { uploadBanner, createProject } from '@/services/createProjectServices';

interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { isLoggedIn, session } = useAuthStore();

  const {
    title,
    description,
    tags,
    bannerUrl,
    roles,
    setTitle,
    setDescription,
    setTags,
    setBannerUrl,
    setRoles,
    resetProject,
  } = useProjectStore();

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState({
    titleError: '',
    descriptionError: '',
    bannerError: '',
    tagsError: '',
    rolesError: '',
  });

  const validateFields = () => {
    const newErrors = {
      titleError: title.trim() ? '' : 'Project title is required.',
      descriptionError: description.trim()
        ? ''
        : 'Project description is required.',
      bannerError: bannerUrl || bannerFile
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

    return Object.values(newErrors).every((error) => !error);
  };

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

  return showPreview ? (
    <PreviewProject
      onClosePreview={() => setShowPreview(false)}
      onCreateProject={handleCreateProject}
    />
  ) : (
    <div className={styles.createProjectModal}>
      <div className={styles.createProjectContent}>
        <div className={styles.modalHeader}>
          <h1>Create a New Project</h1>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className={styles.inputContainer}>
          <Title title={title} setTitle={setTitle} />
          {errors.titleError && <p>{errors.titleError}</p>}
        </div>
        <div className={styles.inputContainer}>
          <Description description={description} setDescription={setDescription} />
          {errors.descriptionError && <p>{errors.descriptionError}</p>}
        </div>
        <div className={styles.inputContainer}>
          <BannerSelector
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
            setBannerFile={setBannerFile}
          />
          {errors.bannerError && <p>{errors.bannerError}</p>}
        </div>
        <div className={styles.inputContainer}>
          <TagsSelector selectedTags={tags} setSelectedTags={setTags} />
          {errors.tagsError && <p>{errors.tagsError}</p>}
        </div>
        <div className={styles.inputContainer}>
          <RolesSelector selectedRoles={roles} setSelectedRoles={setRoles} />
          {errors.rolesError && <p>{errors.rolesError}</p>}
        </div>
        <button onClick={() => setShowPreview(true)} disabled={loading} className={styles.previewButton}>
          Preview Project
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
