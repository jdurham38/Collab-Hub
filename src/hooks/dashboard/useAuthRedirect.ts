import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const useAuthRedirect = () => {
  const { user } = useAuth();
  const router = useRouter();
  const userRef = useRef(user);

  useEffect(() => {
      if(user && userRef.current?.id !== user.id) {
         if (!user) {
          router.push('/');
         }
         userRef.current = user;
      }
     else if (!user) {
          router.push('/')
      }

  }, [user, router]);

  return user;
};

export default useAuthRedirect;