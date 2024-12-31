
import { useState, useEffect } from 'react';
import { validatePrivileges } from '@/services/privilegesService';
import { Privileges } from '@/services/privilegesService'; 

const useCanCreateChannel = (projectId: string, currentUserId: string) => {
  const [canCreateChannel, setCanCreateChannel] = useState(false);

  useEffect(() => {
    const checkPrivileges = async () => {
      try {
        const privileges: Privileges = await validatePrivileges(projectId, currentUserId);
        
        setCanCreateChannel(privileges.canCreateChannel);
      } catch (error) {
        console.error('Error validating privileges:', error);
      }
    };
    checkPrivileges();
  }, [projectId, currentUserId]);

  return canCreateChannel;
};

export default useCanCreateChannel;
