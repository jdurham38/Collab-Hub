
'use client';
import { useEffect, useState } from 'react';
import { fetchFilteredProjects } from '@/services/DiscoverProjects/fetchProject';

export interface Project {
    id: string;
    title: string;
    description: string;
    banner_url: string;
    tags: string[];
    roles: string[];
    createdAt: string;
    created_by: string;
    created_by_username: string;
}

const useAllProjects = (userId: string | undefined, page: number, filters: {
    tags: string[];
    roles: string[];
    dateRange: string;
}, searchTerm: string) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUserProjects = async () => {
            try {
                const userProjectData = await fetchFilteredProjects(userId, page, filters, searchTerm);
                setProjects(userProjectData.projects);
                setError(null);
            } catch (error) {
                console.error('Error fetching projects:', error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProjects();
    }, [userId, page, filters, searchTerm]);

    return { projects, loading, error };
};

export default useAllProjects;