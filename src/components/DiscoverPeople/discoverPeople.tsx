// components/DiscoverPeople/discoverPeople.tsx
import React from 'react';
import ProtectedComponent from "@/components/ProtectedComponent/protected-page";
import styles from './DiscoverPeople.module.css';
import UserGrid from './CardGrid/UserGrid';
const DiscoverPeople: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <ProtectedComponent />
            <div className={styles.contentContainer}>
                 <h2 className={styles.pageTitle}>Discover People</h2>
                 <UserGrid />
            </div>
        </div>
    );
};

export default DiscoverPeople;