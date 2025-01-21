'use client';

import Dashboard from '@/components/Dashboard/Dashboard';
import ProtectedComponent from '@/components/ProtectedComponent/protected-page';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {

  return (
    <div>
      <ProtectedComponent />
      <Dashboard />
    </div>
  );
}
