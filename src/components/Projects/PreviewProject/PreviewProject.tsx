import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProjectStore } from '@/store/useProjectStore';
import PreviewDescription from './PreviewDescription/PreviewDescription';
import PreviewBanner from './PreviewBanner/PreviewBanner';
import PreviewTags from './PreviewTags/PreviewTags';
import PreviewRoles from './PreviewRoles/PreviewRoles';
import styles from './PreviewProject.module.css';
import PreviewSettings from './PreviewSettings/PreviewSettings';
import PreviewMessaging from './PreviewMessaging/PreviewMessaging';
import ProjectUsers from './PreviewProjectUsers/Users';
import useBodyClass from '@/hooks/preview/useBodyClass';

interface PreviewProjectProps {
  onClosePreview: () => void;
  onCreateProject: () => Promise<void>;
  bannerUrl: string;
}

const PreviewProject: React.FC<PreviewProjectProps> = ({
  onClosePreview,
  onCreateProject,
  bannerUrl,
}) => {
  const { title, description, tags, roles } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'messaging' | 'settings'
  >('overview');

  useBodyClass('modal-open');

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      await onCreateProject();
      toast.success('Project created successfully!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClosePreview}>
      <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.previewHeader}>
          <button
            onClick={onClosePreview}
            className={styles.editButton}
            disabled={loading}
          >
            Continue Editing
          </button>
          <button
            onClick={handleCreateProject}
            className={styles.createButton}
            disabled={loading}
          >
            Create Project
          </button>
        </div>

        <div className={styles.previewContainer}>
          <PreviewBanner bannerUrl={bannerUrl} title={title} />

          <div className={styles.tabContainer}>
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'overview' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'messaging' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('messaging')}
              >
                Messaging
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'settings' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div>
                <div className={styles.flexContainer}>
                  <PreviewDescription description={description} />
                  <ProjectUsers />
                </div>
                <div className={styles.flexContainer}>
                  <PreviewTags tags={tags} />
                  <PreviewRoles roles={roles} />
                </div>
              </div>
            )}

            {activeTab === 'messaging' && <PreviewMessaging />}
            {activeTab === 'settings' && <PreviewSettings />}
          </div>

          {loading && (
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.spinnerMessage}>
                Give us a second while we create your project!
              </p>
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default PreviewProject;
