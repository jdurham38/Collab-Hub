"use client";

import React, { useEffect, useState } from 'react';
import Settings from './components/Settings/Settings';
import ProjectMessaging from './components/Messaging/Messaging';
import Overview from './components/ProjectDetails/Overview';
import Nav from './components/Nav/Nav';
import styles from './ProjectPage.module.css';
import ProjectBanner from './components/ProjectDetails/Banner/Banner';
import { Project } from '@/utils/interfaces';
import { getBanner } from '@/services/IndividualProjects/overview';
import getSupabaseClient from '@/lib/supabaseClient/supabase';

interface ProjectPageProps {
  params: { id: string };
}

interface User {
  id: string;
  email: string;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { id: projectId } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'messaging' | 'settings'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await getBanner(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching current user:', error.message);
      } else if (user) {
        const email = user.user_metadata?.email || user.email;
        setCurrentUser({
          id: user.id,
          email: email,
        });
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;
  if (!currentUser) return <div>Please log in to view this project.</div>;

  return (
    <div className={styles.projectPage}>
      <ProjectBanner bannerUrl={project.banner_url} title={project.title} />

      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.tabContent}>
        {activeTab === 'overview' && <Overview projectId={projectId} />}
        {activeTab === 'messaging' && (
          <ProjectMessaging projectId={projectId} currentUser={currentUser} />
        )}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default ProjectPage;
