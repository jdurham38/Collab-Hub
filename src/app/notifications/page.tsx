'use client';

import Notifications from '@/components/Notifications/Notifications';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  
      if(loading) return <div>Loading...</div>;
  
      if(!user) return <div>Not Authenticated</div>
  
  return (
    <div>
      <Notifications />
    </div>
  );
}
