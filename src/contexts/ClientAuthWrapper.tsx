'use client';

import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/navbar/navbar';

const ClientAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <>
      {isLoggedIn && <Navbar />}
      {children}
    </>
  );
};

export default ClientAuthWrapper;
