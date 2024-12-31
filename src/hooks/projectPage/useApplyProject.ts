'use client';

import { useState, useEffect } from 'react';
import { applyToProject, checkApplicationStatus } from '@/services/DiscoverProjects/apply-project';


interface CheckApplicationStatusResponse {
  hasApplied: boolean;
}


interface UseApplyProjectResult {
    isApplying: boolean;
    hasApplied: boolean | null; 
    apply: (projectId: string, userId: string) => Promise<void>;
    error: string | null;
    isLoading: boolean; 
}


interface ApiError {
    message: string;
}

const useApplyProject = (projectId: string, userId: string | null): UseApplyProjectResult => {
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState<boolean | null>(null); 
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
      const fetchApplicationStatus = async () => {
        if (!projectId || !userId) {
             setIsLoading(false)
            return;
        }
         setIsLoading(true);
         setError(null);
        try {
            const response = await checkApplicationStatus(
                projectId,
                userId
            );
             const { hasApplied: initialHasApplied } = response as CheckApplicationStatusResponse 
            setHasApplied(initialHasApplied);
        } catch (e: unknown) { 
            const apiError = e as ApiError;
           console.error("Error while fetching status:", apiError);
            setError(apiError?.message || 'Failed to load application status.');
        } finally {
              setIsLoading(false)
        }
    };

        fetchApplicationStatus();
    }, [projectId, userId]);


    const apply = async (projectId: string, userId: string) => {
        setIsApplying(true);
        setError(null);
        try {
            await applyToProject(projectId, userId);
            setHasApplied(true);
        } catch (e: unknown) { 
            const apiError = e as ApiError;
            setError(apiError?.message || 'An error occurred while applying.');
        } finally {
            setIsApplying(false);
        }
    };


    return {
        isApplying,
        hasApplied,
        apply,
        error,
        isLoading,
    };
};

export default useApplyProject;