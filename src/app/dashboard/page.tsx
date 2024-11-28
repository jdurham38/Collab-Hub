'use client'

import Dashboard from "@/components/Dashboard/Dashboard"
import ProtectedComponent from "@/components/ProtectedComponent/protected-page";
export default function DashboardPage() {
  return (
    <div>
      <ProtectedComponent />
      <Dashboard />
    </div>
  );
}
