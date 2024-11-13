import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PreviewTitle from './PreviewTitle/PreviewTitle';
import { useProjectStore } from '@/utils/useProjectStore';
import PreviewDescription from './PreviewDescription/PreviewDescription';
import PreviewBanner from './PreviewBanner/PreviewBanner';
import PreviewTags from './PreviewTags/PreviewTags';
import PreviewRoles from './PreviewRoles/PreviewRoles';
import styles from './PreviewProject.module.css';

interface PreviewProjectProps {
  onClosePreview: () => void;
  onCreateProject: () => Promise<void>; // async function to create project
}

const PreviewProject: React.FC<PreviewProjectProps> = ({ onClosePreview, onCreateProject }) => {
  const { title, description, bannerUrl, tags, roles } = useProjectStore();
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      await onCreateProject();
      toast.success("Project created successfully!");
    } catch {
      toast.error("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h1>Project Preview</h1>
        <button onClick={onClosePreview} className={styles.editButton} disabled={loading}>
          Continue Editing
        </button>
      </div>

      <PreviewTitle title={title} />
      <PreviewBanner bannerUrl={bannerUrl} />
      <PreviewDescription description={description} />
      <PreviewTags tags={tags} />
      <PreviewRoles roles={roles} />

      {loading ? (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.spinnerMessage}>Give us a second while we create your project!</p>
        </div>
      ) : (
        <button onClick={handleCreateProject} className={styles.createButton}>
          Create Project
        </button>
      )}
    </div>
  );
};

export default PreviewProject;
