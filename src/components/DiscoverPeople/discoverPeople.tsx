'use client';
import React from 'react';
import ProtectedComponent from "@/components/ProtectedComponent/protected-page";
import styles from './DiscoverPeople.module.css';

import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import UserGrid from './CardGrid/UserGrid';

const DiscoverPeople: React.FC = () => {
    const user = useAuthRedirect();

    if (status === "loading") {
         return <div>Loading...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <ProtectedComponent />
            <div className={styles.contentContainer}>
                 <UserGrid userId={user?.id} />
            </div>
        </div>
    );
};

export default DiscoverPeople;