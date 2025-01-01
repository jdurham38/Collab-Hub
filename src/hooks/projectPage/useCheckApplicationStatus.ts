'use client';

import { useState, useEffect } from 'react';
import { checkApplicationStatus } from '@/services/DiscoverProjects/apply-project';

interface CheckApplicationStatusResponse {
  hasApplied: boolean;
}

interface UseCheckApplicationStatusResult {
    hasApplied: boolean | null;
    error: string | null;
    isLoading: boolean;
    setHasApplied: React.Dispatch<React.SetStateAction<boolean | null>>;
}

interface ApiError {
    message: string;
}

const useCheckApplicationStatus = (projectId: string, userId: string | null): UseCheckApplicationStatusResult => {
    const [hasApplied, setHasApplied] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplicationStatus = async () => {
            if (!projectId || !userId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await checkApplicationStatus(
                    projectId,
                    userId
                );
                 const { hasApplied: initialHasApplied } = response as CheckApplicationStatusResponse;
                setHasApplied(initialHasApplied);
            } catch (e: unknown) {
                const apiError = e as ApiError;
                console.error("Error while fetching status:", apiError);
                setError(apiError?.message || 'Failed to load application status.');
            } finally {
                 setIsLoading(false);
            }
        };

        fetchApplicationStatus();
    }, [projectId, userId]);

    return {
        hasApplied,
        error,
        isLoading,
         setHasApplied,
    };
};

export default useCheckApplicationStatus;