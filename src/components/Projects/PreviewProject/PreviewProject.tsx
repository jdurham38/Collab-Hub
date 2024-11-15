import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'messaging' | 'settings'>('overview');

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
    <div>
      <div className={styles.previewHeader}>
      <button onClick={onClosePreview} className={styles.editButton} disabled={loading}>
          Continue Editing
        </button>
        <button onClick={handleCreateProject} className={styles.createButton} disabled={loading}>
          Create Project
        </button>
      </div>

      <div className={styles.previewContainer}>
        <PreviewBanner bannerUrl={bannerUrl} title={title} />
        
        <div className={styles.tabContainer}>
          <div className={styles.tabButtons}>
            <button className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`${styles.tabButton} ${activeTab === 'messaging' ? styles.active : ''}`} onClick={() => setActiveTab('messaging')}>Messaging</button>
            <button className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div>
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
        ) : null}
      </div>
    </div>
  );
};

export default PreviewProject;