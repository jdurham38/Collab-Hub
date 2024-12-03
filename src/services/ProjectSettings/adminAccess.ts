import axios from 'axios';

export const grantAdminAccess = async (
    projectId: string,
    userId: string
  ) => {
    try{
      const response = await axios.post(`api/projects/${projectId}/grantAdminPrivileges`, {
        userId,
      });
      return response.data.collaborator;
    } catch ( error ){
      if(axios.isAxiosError(error)){
        const errorMessage = error.response?.data?.error || 'failed to upgrade privileges';
        throw new Error(errorMessage);
      } else{
        throw new Error('an unexpected error has occurred')
      }
    }
  }
  