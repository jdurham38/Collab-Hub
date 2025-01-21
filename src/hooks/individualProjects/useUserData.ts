import { useState, useEffect, useRef } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { useAuth } from '@/contexts/AuthContext';
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
    const { user: authUser, loading: authLoading } = useAuth();


  const previousAuthId = useRef<string | null>(null);


    useEffect(() => {
        const fetchUser = async () => {
            if (authLoading) {
                return;
            }

            setLoading(true);
            try {

                if (!authUser?.id) {
                    setCurrentUser(null);
                    setAdminPrivileges(false);
                    setCanRemoveUser(false);
                    setCanRemoveChannel(false);
                    setCanEditProject(false);
                    setcanEditAdminAccess(false);
                    return;
                }

                if (authUser.id === previousAuthId.current) {
                    setLoading(false);
                    return;
                }
                previousAuthId.current = authUser.id;


                const email = authUser?.email || '';
                const username = authUser?.username || authUser?.email || 'Unknown User';
            

                setCurrentUser({
                    id: authUser.id,
                    email: email,
                    username: username,
                });


              try {
                    const privileges = await validatePrivileges(projectId, authUser.id);

                    setAdminPrivileges(privileges?.adminPrivileges || false);
                    setCanRemoveUser(privileges?.canRemoveUser || false);
                    setCanRemoveChannel(privileges?.canRemoveChannel || false);
                    setCanEditProject(privileges?.canEditProject || false);
                    setcanEditAdminAccess(privileges?.canEditAdminAccess || false);
                } catch (privError) {
                    console.error('Error fetching privileges:', privError);
                    setError(
                         privError instanceof Error
                            ? `Failed to fetch privileges: ${privError.message}`
                            : 'Failed to fetch privileges.',
                    );
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred while fetching user or privileges.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [supabase, projectId, authLoading, authUser]);

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