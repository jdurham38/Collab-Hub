import { useState, useEffect } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { validatePrivileges } from '@/services/privilegesService';

interface User {
  id: string;
  email: string;
  username: string;
}

interface UseUserDataReturn {
  currentUser: User | null;
  adminPrivileges: boolean;
  canRemoveUser: boolean;
  canRemoveChannel: boolean;
  canEditProject: boolean;
  canEditAdminAccess: boolean;
  loading: boolean;
  error: string | null;
}

const useUserData = (projectId: string): UseUserDataReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminPrivileges, setAdminPrivileges] = useState<boolean>(false);
  const [canRemoveUser, setCanRemoveUser] = useState<boolean>(false);
  const [canRemoveChannel, setCanRemoveChannel] = useState<boolean>(false);
  const [canEditProject, setCanEditProject] = useState<boolean>(false);
  const [canEditAdminAccess, setcanEditAdminAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching current user:', userError.message);
          setError(userError.message);
          return;
        }

        if (user) {
          const email = user.user_metadata?.email || user.email;
          const username =
            user.user_metadata?.username || user.email || 'Unknown User';

          setCurrentUser({
            id: user.id,
            email: email,
            username: username,
          });

          // Fetch User Privileges
          try {
            // validatePrivileges should now return an object with all four fields
            const privileges = await validatePrivileges(projectId, user.id);
            setAdminPrivileges(privileges.adminPrivileges);
            setCanRemoveUser(privileges.canRemoveUser);
            setCanRemoveChannel(privileges.canRemoveChannel);
            setCanEditProject(privileges.canEditProject);
            setcanEditAdminAccess(privileges.canEditAdminAccess);
            
            // Also store userIsOwner somewhere
            const userIsOwner = privileges.userIsOwner;

          } catch (privError) {
            console.error('Error fetching privileges:', privError);
            setError(
              privError instanceof Error
                ? privError.message
                : 'Failed to fetch privileges.'
            );
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase, projectId]);

  return {
    currentUser,
    adminPrivileges,
    canRemoveUser,
    canRemoveChannel,
    canEditProject,
    canEditAdminAccess,
    loading,
    error,
  };
};

export default useUserData;
