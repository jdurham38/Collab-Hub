// /hooks/individualProjects/settings/useToggleAdminAccess.ts

import { useState } from 'react';
import { toggleAdminAccess } from '@/services/ProjectSettings/adminAccess';
import { toast } from 'react-toastify';

interface UseToggleAdminAccessReturn {
  updatingUserId: string | null;
  toggleAdmin: (projectId: string, userId: string, currentStatus: boolean) => Promise<boolean>;
  error: string | null;
}

const useToggleAdminAccess = (): UseToggleAdminAccessReturn => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleAdmin = async (projectId: string, userId: string, currentStatus: boolean): Promise<boolean> => {
    setUpdatingUserId(userId);
    setError(null);
    try {
      const response = await toggleAdminAccess(projectId, userId, !currentStatus);

      if (response && typeof response.adminPrivileges === 'boolean') {
        toast.success(`Admin access ${!currentStatus ? 'granted' : 'revoked'} successfully.`);
        return true;
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdatingUserId(null);
    }
  };

  return { updatingUserId, toggleAdmin, error };
};

export default useToggleAdminAccess;
