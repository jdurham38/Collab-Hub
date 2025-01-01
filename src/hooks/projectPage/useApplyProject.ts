'use client';

import { useState } from 'react';
import { applyToProject } from '@/services/DiscoverProjects/apply-project';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UseApplyProjectResult {
    isApplying: boolean;
    apply: (projectId: string, userId: string, setHasApplied: React.Dispatch<React.SetStateAction<boolean | null>>) => Promise<void>;
    error: string | null;
}

interface ApiError {
    message: string;
}

const useApplyProject = (): UseApplyProjectResult => {
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apply = async (projectId: string, userId: string, setHasApplied: React.Dispatch<React.SetStateAction<boolean | null>>) => {
        setIsApplying(true);
        setError(null);
        try {
            await applyToProject(projectId, userId);
            toast.success('You have successfully applied!');
            setHasApplied(true); // Optimistically update hasApplied
        } catch (e: unknown) {
             const apiError = e as ApiError;
            setError(apiError?.message || 'An error occurred while applying.');
             toast.error('Unable to apply for this project, you may have already applied or are already a part of this project')
        } finally {
            setIsApplying(false);
        }
    };
    return {
        isApplying,
        apply,
        error,
    };
};

export default useApplyProject;