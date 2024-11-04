'use client';

import { useAuthStore } from '@/lib/useAuthStore';
import Navbar from '@/components/navbar/navbar'

const ClientAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <>
      {isLoggedIn && <Navbar />} {/* Render Navbar only if logged in */}
      {children}
    </>
  );
};

export default ClientAuthWrapper;
