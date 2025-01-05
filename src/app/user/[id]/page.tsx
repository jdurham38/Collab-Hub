'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User } from '@/utils/interfaces';
import Loader from '@/components/Loader/Loader';
import styles from './page.module.css';

const UserProfilePage: React.FC = () => {
    const params = useParams();
    const id = params?.id as string;
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) {
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`/api/users-page/users?userId=${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user: ${response.statusText}`);
                }
                const { users } = await response.json();

                if (users && users.length > 0) {
                    setUserInfo(users[0]);
                } else {
                    setError("User not found");
                }
            } catch (e) {
                let errorMessage = "An unexpected error occurred.";
                if (e instanceof Error) {
                    errorMessage = e.message || 'An error occurred while fetching user.';
                } else if (typeof e === 'string'){
                    errorMessage = e;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);


    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userInfo) {
        return <div>User not found.</div>;
    }

    return (
        <div className={styles.userProfileContainer}>
            <h2 className={styles.username}>{userInfo?.username}</h2>
            {userInfo?.bio && <p className={styles.bio}>{userInfo.bio}</p>}
            {userInfo?.role && <p className={styles.role}>Role: {userInfo.role}</p>}
            {userInfo?.personalWebsite && (
                <a href={userInfo.personalWebsite} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    Website
                </a>
            )}
            <div className={styles.socialLinks}>
                {userInfo?.instagramLink && (
                    <a href={userInfo.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Instagram
                    </a>
                )}
                {userInfo?.linkedinLink && (
                    <a href={userInfo.linkedinLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        LinkedIn
                    </a>
                )}
                {userInfo?.behanceLink && (
                    <a href={userInfo.behanceLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Behance
                    </a>
                )}
                {userInfo?.twitterLink && (
                    <a href={userInfo.twitterLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Twitter
                    </a>
                )}
                {userInfo?.tiktokLink && (
                    <a href={userInfo.tiktokLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        TikTok
                    </a>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;