// /hooks/useCanCreateChannel.ts
import { useState, useEffect } from 'react';
import { validatePrivileges } from '@/services/privilegesService';
import { Privileges } from '@/services/privilegesService'; // Import the Privileges interface

const useCanCreateChannel = (projectId: string, currentUserId: string) => {
  const [canCreateChannel, setCanCreateChannel] = useState(false);

  useEffect(() => {
    const checkPrivileges = async () => {
      try {
        const privileges: Privileges = await validatePrivileges(projectId, currentUserId);
        // Now extract canCreateChannel from the privileges object
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
