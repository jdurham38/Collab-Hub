// hooks/dashboard/useProjectRequestNotifications.ts
import { useState, useEffect } from 'react';
import projectRequestService from '@/services/Notifications/ProjectRequests/applicationRequests';
import useAuthRedirect from '../dashboard/useAuthRedirect';
const useProjectRequestNotifications = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthRedirect();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user?.id) {
          const data = await projectRequestService.fetchProjectRequests(
            user.id,
          );
           // Assuming all requests are new since we don't have a read status
          setRequestCount(data.length);
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user?.id]);
    
     return { requestCount, loading, error };

};

export default useProjectRequestNotifications;