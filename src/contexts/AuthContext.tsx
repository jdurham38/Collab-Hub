'use client';

import React, {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
    useMemo,
    useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/utils/interfaces';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './Auth.module.css';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn, setLoggedIn, setSession, session } = useAuthStore();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const isMounted = useRef(false);
    const supabase = useMemo(() => getSupabaseClient(), []);
    const sessionRef = useRef(session);


     useEffect(() => {
         const initializeAuth = async () => {
             setLoading(true);
             try {
                 if (session && isLoggedIn) {
                    const userData = session.user;
                      setUser((prevUser) => {
                            if (prevUser?.id !== userData.id) {
                               return {
                                   id: userData.id,
                                   email: userData.email || '',
                                   username: userData.user_metadata?.username || '',
                               };
                           }
                           return prevUser;
                       });
                 } else {
                     const {
                         data: { session: freshSession },
                         error,
                     } = await supabase.auth.getSession();


                     if (error || !freshSession) {
                          setLoggedIn(false);
                            setUser(null);
                            router.push('/');
                         } else {
                             setSession(freshSession);
                            const userData = freshSession.user;
                            setUser({
                               id: userData.id,
                                email: userData.email || '',
                                username: userData.user_metadata?.username || '',
                            });
                             setLoggedIn(true);
                         }
                 }
             } catch (err) {
                 console.error('Unexpected error:', err);
                   setUser(null);
                 setLoggedIn(false);
                  router.push('/');
             } finally {
                 setLoading(false);
             }
         };

        if(isMounted.current) {
            if (session !== sessionRef.current) {
                initializeAuth();
            }
        }
        else {
            initializeAuth();
            isMounted.current = true;
        }

      }, [router, session, isLoggedIn, setLoggedIn, setSession, supabase.auth]);

    useEffect(() => {
         sessionRef.current = session;
    }, [session])


    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                     setSession(session);
                     const userData = session.user;
                     setUser({
                        id: userData.id,
                        email: userData.email || '',
                        username: userData.user_metadata?.username || '',
                    });
                     setLoggedIn(true);
                 } else if (event === 'SIGNED_OUT') {
                     setSession(null);
                     setUser(null);
                     setLoggedIn(false);
                     router.push('/');
                 }
             },
        );
         return () => {
             authListener.subscription.unsubscribe();
         };
     }, [router, setLoggedIn, setSession, supabase.auth]);


    const contextValue = useMemo(
        () => ({ user, setUser, loading }),
        [user, loading],
    );

    if (loading) {
        return (
            <div className={styles.spinnerContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};