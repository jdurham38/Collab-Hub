'use client';
import React, { useState, useMemo, lazy, Suspense } from 'react';
import styles from './Nav.module.css';

const EditProfile = lazy(() => import('../Profile/Profile'));
const SecuritySettings = lazy(() => import('../Auth/main'));

type ContentComponent = React.FC;

interface NavItem {
    title: string;
    component: ContentComponent;
}

const UserNav: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isNavOpen, setIsNavOpen] = useState(true);

    const navItems: NavItem[] = useMemo(() => [
        { title: 'Profile', component: () => <Suspense fallback={<div>Loading...</div>}><EditProfile /></Suspense> },
        { title: 'Account', component: () => <Suspense fallback={<div>Loading...</div>}><SecuritySettings /></Suspense> },
        { title: 'Friend Requests', component: () => <div>Friend Requests Content</div> },
        { title: 'Project Updates', component: () => <div>Project Updates Content</div> },
        { title: 'Gloabal Updates', component: () => <div>Global Updates Content</div> },
    ], []);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <>
            <button
                className={`${styles.filterToggleButton} ${isNavOpen ? '' : styles.filterIconOpen}`}
                onClick={toggleNav}
                style={{  
                    display: isNavOpen ? 'none' : 'flex',
                }}
            >
                <span className={styles.filterIcon}></span>
            </button>
            <div className={styles.container}>
                <div className={`${styles.navItems} ${isNavOpen ? styles.navOpen : styles.navClosed}`}>
                    <div className={styles.navHeader}>
                        <span className={styles.navTitle}></span>
                        <span className={styles.navExitButton} onClick={toggleNav}>x</span>
                    </div>
                    {navItems.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.navItem} ${activeTab === index ? styles.active : ''}`}
                            onClick={() => setActiveTab(index)}
                        >
                            {item.title}
                        </div>
                    ))}
                </div>
                <div className={styles.contentContainer}>
                    {React.createElement(navItems[activeTab].component)}
                </div>
            </div>
        </>
    );
};

export default UserNav;