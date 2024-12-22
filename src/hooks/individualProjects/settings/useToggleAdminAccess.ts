import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface PermissionFields {
  adminPrivileges?: boolean;
  canRemoveUser?: boolean;
  canRemoveChannel?: boolean;
  canEditProject?: boolean;
  canEditAdminAccess?: boolean;
}

interface UseToggleAdminAccessReturn {
  updatingUserId: string | null;
  updatePermissions: (
    projectId: string,
    userId: string,
    fields: PermissionFields
  ) => Promise<boolean>;
  error: string | null;
}

const useToggleAdminAccess = (): UseToggleAdminAccessReturn => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePermissions = async (
    projectId: string,
    userId: string,
    fields: PermissionFields
  ): Promise<boolean> => {
    setUpdatingUserId(userId);
    setError(null);
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/collaborators/${userId}`,
        fields
      );
      const data = response.data;
      if (data && data.collaborator) {
        return true;
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (axios.isAxiosError(err)) {
          errorMessage = err?.response?.data?.error || err.message || 'An unexpected error occurred.';
      } else if (err instanceof Error) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdatingUserId(null);
    }
  };

  return { updatingUserId, updatePermissions, error };
};

export default useToggleAdminAccess;