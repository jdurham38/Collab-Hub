// File: /pages/projects/[id]/page.tsx (Assuming Next.js 13+ with App Router)

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
import { validatePrivileges } from '@/services/privilegesService';

interface ProjectPageProps {
  params: { id: string };
}

interface User {
  id: string;
  email: string;
  username: string;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { id: projectId } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'messaging' | 'settings'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [privilegesLoading, setPrivilegesLoading] = useState<boolean>(true);
  const [adminPrivileges, setAdminPrivileges] = useState<boolean>(false);
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
        const username = user.user_metadata?.username || user.email || 'Unknown User'; // Updated fallback
        setCurrentUser({
          id: user.id,
          email: email,
          username: username,
        });

        // **Fetch User Privileges**
        try {
          setPrivilegesLoading(true);
          const isAdmin = await validatePrivileges(projectId, user.id);
          setAdminPrivileges(isAdmin);
        } catch {
          console.error('Error fetching privileges:');
        } finally {
          setPrivilegesLoading(false);
        }
      }
    };

    fetchCurrentUser();
  }, [supabase, projectId]);

  if (loading || privilegesLoading) return <div>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!project) return <div className={styles.error}>Project not found.</div>;
  if (!currentUser) return <div>Please log in to view this project.</div>;

  // **Define Tabs Based on Privileges**
  const tabs: Array<'overview' | 'messaging' | 'settings'> = ['overview', 'messaging'];
  if (adminPrivileges) {
    tabs.push('settings');
  }

  return (
    <div className={styles.projectPage}>
      <ProjectBanner bannerUrl={project.banner_url} title={project.title} />

      <Nav activeTab={activeTab} setActiveTab={setActiveTab} availableTabs={tabs} />

      <div className={styles.tabContent}>
        {activeTab === 'overview' && <Overview projectId={projectId} />}
        {activeTab === 'messaging' && (
          <ProjectMessaging projectId={projectId} currentUser={currentUser} />
        )}
        {activeTab === 'settings' && adminPrivileges && <Settings projectId={projectId} />}
      </div>
    </div>
  );
};

export default ProjectPage;
