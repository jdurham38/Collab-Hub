// /hooks/individualProjects/settings/useToggleAdminAccess.ts
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface PermissionFields {
  adminPrivileges?: boolean;
  canRemoveUser?: boolean;
  canRemoveChannel?: boolean;
  canEditProject?: boolean;
}

interface UseToggleAdminAccessReturn {
  updatingUserId: string | null;
  toggleAdmin: (projectId: string, userId: string, fields: PermissionFields) => Promise<boolean>;
  error: string | null;
}

const useToggleAdminAccess = (): UseToggleAdminAccessReturn => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleAdmin = async (projectId: string, userId: string, fields: PermissionFields): Promise<boolean> => {
    setUpdatingUserId(userId);
    setError(null);
    try {
      const response = await axios.patch(`/api/projects/${projectId}/collaborators/${userId}`, fields);
      const data = response.data;
      if (data && data.collaborator) {
        toast.success('Privileges updated successfully.');
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
