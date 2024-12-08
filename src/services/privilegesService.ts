// services/privilegesService.ts
import axios from 'axios';

export interface Privileges {
  userIsOwner: boolean;
  adminPrivileges: boolean;
  canRemoveUser: boolean;
  canRemoveChannel: boolean;
  canEditProject: boolean;
  canCreateChannel: boolean;
  canEditAdminAccess: boolean;
}

export const validatePrivileges = async (
  projectId: string,
  userId: string,
): Promise<Privileges> => {
  try {
    const response = await axios.post(
      `/api/projects/${projectId}/validatePrivileges`,
      { userId },
    );

    const data = response.data;

    return {
      userIsOwner: data.userIsOwner ?? false,
      adminPrivileges: data.adminPrivileges ?? false,
      canRemoveUser: data.canRemoveUser ?? false,
      canRemoveChannel: data.canRemoveChannel ?? false,
      canEditProject: data.canEditProject ?? false,
      canCreateChannel: data.canCreateChannel ?? false,
      canEditAdminAccess: data.canEditAdminAccess ?? false,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to validate privileges.';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while validating privileges.',
      );
    }
  }
};
