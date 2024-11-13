import React, { useEffect, useState } from 'react';
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

interface CreateProjectProps {
  onClose: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose }) => {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { isLoggedIn, session } = useAuthStore();

  // Zustand state and actions
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
  const handleOutsideClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains(styles.createProjectModal)) {
      handleClose();
    }
  };
    // Clear title error as user types
    useEffect(() => {
      if (title) {
        setErrors((prev) => ({ ...prev, titleError: '' }));
      }
    }, [title]);

  // Clear description error as user types
  useEffect(() => {
    if (description) {
      setErrors((prev) => ({ ...prev, descriptionError: '' }));
    }
  }, [description]);

  // Clear tags, roles, or bannerUrl errors on change
  useEffect(() => {
    if (tags.length > 0 && tags.length <= 5) {
      setErrors((prev) => ({ ...prev, tagsError: '' }));
    }
  }, [tags]);

  useEffect(() => {
    if (roles.length > 0 && roles.length <= 5) {
      setErrors((prev) => ({ ...prev, rolesError: '' }));
    }
  }, [roles]);

  useEffect(() => {
    if (bannerUrl || bannerFile) {
      setErrors((prev) => ({ ...prev, bannerError: '' }));
    }
  }, [bannerUrl, bannerFile]);

  // Validation function
  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      titleError: '',
      descriptionError: '',
      bannerError: '',
      tagsError: '',
      rolesError: '',
    };

    if (!title.trim()) {
      newErrors.titleError = 'Project title is required.';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.descriptionError = 'Project description is required.';
      isValid = false;
    }

    if (!bannerUrl && !bannerFile) {
      newErrors.bannerError = 'Please select or upload a banner image for your project.';
      isValid = false;
    }

    if (tags.length === 0) {
      newErrors.tagsError = 'Please select at least one tag.';
      isValid = false;
    } else if (tags.length > 5) {
      newErrors.tagsError = 'You can select up to 5 tags only.';
      isValid = false;
    }

    if (roles.length === 0) {
      newErrors.rolesError = 'Please select at least one role.';
      isValid = false;
    } else if (roles.length > 5) {
      newErrors.rolesError = 'You can select up to 5 roles only.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Preview handling
  const handlePreview = () => {
    if (validateFields()) {
      setShowPreview(true);
    } else {
      toast.error("Please fill out all required fields.");
    }
  };

  // Project creation handler
  const handleCreateProject = async () => {
    if (!isLoggedIn || !session) {
      toast.error('You must be logged in to create a project.');
      return;
    }

    if (!validateFields()) return;

    setLoading(true);

    try {
      let finalBannerUrl = bannerUrl;

      // Upload banner if a file is selected
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
      toast.success('Project created successfully!');
      resetProject(); // Clear state after successful creation
      router.push(`/projects/${projectId}`);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modal close handler with state reset
  const handleClose = () => {
    resetProject(); // Clear state when modal is closed
    onClose();
  };

  if (showPreview) {
    return (
      <PreviewProject
        onClosePreview={() => setShowPreview(false)}
        onCreateProject={handleCreateProject}
      />
    );
  }

  return (
    <div className={styles.createProjectModal} onClick={handleOutsideClick}>
      <div className={styles.createProjectContent}>
        <div className={styles.modalHeader}>
          <h1 className={styles.modalTitle}>Create a New Project</h1>
          <button className={styles.closeButton} onClick={handleClose}>
            {'\u00D7'}
          </button>
        </div>
  
        {/* Title Field with Asterisk */}
        <div className={styles.inputContainer}>
          <span className={styles.asterisk}>*</span>
          <Title title={title} setTitle={setTitle} />
        </div>
        {errors.titleError && <p className={styles.error}>{errors.titleError}</p>}
  
        {/* Description Field with Asterisk */}
        <div className={styles.inputContainer}>
          <span className={styles.asterisk}>*</span>
          <Description description={description} setDescription={setDescription} />
        </div>
        {errors.descriptionError && <p className={styles.error}>{errors.descriptionError}</p>}
  
        {/* BannerSelector Field with Asterisk */}
        <div className={styles.inputContainer}>
          <span className={styles.asterisk}>*</span>
          <BannerSelector bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} setBannerFile={setBannerFile} />
        </div>
        {errors.bannerError && <p className={styles.error}>{errors.bannerError}</p>}
  
        {/* TagsSelector Field with Asterisk */}
        <div className={styles.inputContainer}>
          <span className={styles.asterisk}>*</span>
          <TagsSelector selectedTags={tags} setSelectedTags={setTags} />
        </div>
        {errors.tagsError && <p className={styles.error}>{errors.tagsError}</p>}
  
        {/* RolesSelector Field with Asterisk */}
        <div className={styles.inputContainer}>
          <span className={styles.asterisk}>*</span>
          <RolesSelector selectedRoles={roles} setSelectedRoles={setRoles} />
        </div>
        {errors.rolesError && <p className={styles.error}>{errors.rolesError}</p>}
        <div className={styles.buttonContainer}>
        <button className={styles.previewButton} onClick={handlePreview} disabled={loading}>
          Preview Project
        </button>
        </div>
  
        {loading && (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <p>Creating project...</p>
          </div>
        )}
      </div>
    </div>
  );
  };

export default CreateProject;
