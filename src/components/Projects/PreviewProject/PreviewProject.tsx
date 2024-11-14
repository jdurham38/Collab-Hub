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
import PreviewSettings from './PreviewSettings/PreviewSettings';
import PreviewMessaging from './PreviewMessaging/PreviewMessaging';

interface PreviewProjectProps {
  onClosePreview: () => void;
  onCreateProject: () => Promise<void>;
}

const PreviewProject: React.FC<PreviewProjectProps> = ({ onClosePreview, onCreateProject }) => {
  const { title, description, bannerUrl, tags, roles } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'messaging' | 'settings'>('description');

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
  <div className={styles.bannerWrapper}>
<PreviewBanner bannerUrl={bannerUrl} title={title} />
  </div>

  <div className={styles.previewHeader}>
    <h1>Project Preview</h1>
    <button onClick={onClosePreview} className={styles.editButton} disabled={loading}>
      Continue Editing
    </button>
  </div>

  <div className={styles.tabContainer}>
    <div className={styles.tabButtons}>
      <button className={`${styles.tabButton} ${activeTab === 'description' ? styles.active : ''}`} onClick={() => setActiveTab('description')}>Description</button>
      <button className={`${styles.tabButton} ${activeTab === 'messaging' ? styles.active : ''}`} onClick={() => setActiveTab('messaging')}>Messaging</button>
      <button className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
    </div>
  </div>

  <div className={styles.tabContent}>
    {activeTab === 'description' && (
      <div>
        <PreviewTitle title={title} />
        <PreviewDescription description={description} />
        <PreviewTags tags={tags} />
        <PreviewRoles roles={roles} />
      </div>
    )}

    {activeTab === 'messaging' && <PreviewMessaging />}
    {activeTab === 'settings' && <PreviewSettings />}
  </div>

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
