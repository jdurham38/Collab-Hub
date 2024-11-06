// app/project/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './project.module.css';

const supabase = getSupabaseClient();

interface Project {
  title: string;
  created_by: string;
}

const ProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('title, created_by')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!project) return <div>Project not found.</div>;

  return (
    <div className={styles.projectContainer}>
      <h1 className={styles.title}>{project.title}</h1>
      <p className={styles.creator}>Created by: {project.created_by}</p>
    </div>
  );
};

export default ProjectPage;
