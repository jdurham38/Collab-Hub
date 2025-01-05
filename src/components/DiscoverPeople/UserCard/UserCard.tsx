// components/UserCard/UserCard.tsx
'use client';
import React from 'react';
import { User } from '@/utils/interfaces';
import styles from './UserCard.module.css';

interface UserCardProps {
  userInfo: User;
    onViewProfile?: (id: string) => void; // Optional navigation function
}

const UserCard: React.FC<UserCardProps> = ({ userInfo, onViewProfile }) => {

  const handleViewProfile = () => {
      if (onViewProfile) {
          onViewProfile(userInfo.id);
      } else {
           console.log("onViewProfile is not provided, no navigation");
      }
  };

  return (
    <div className={styles.card}>
      <div className={styles.info}>
         <h3 className={styles.username}>{userInfo.username}</h3>
         {userInfo.bio && <p className={styles.bio}>{userInfo.shortBio}</p>}
          {userInfo.role && <p className={styles.role}>Role: {userInfo.role}</p>}
        {userInfo.personalWebsite && (
            <a href={userInfo.personalWebsite} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Website
            </a>
         )}

            <div className={styles.socialLinks}>
                {userInfo.instagramLink && (
                   <a href={userInfo.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                     Instagram
                  </a>
                  )}
                {userInfo.linkedinLink && (
                   <a href={userInfo.linkedinLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                     LinkedIn
                   </a>
                   )}
                {userInfo.behanceLink && (
                  <a href={userInfo.behanceLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Behance
                    </a>
                )}
                {userInfo.twitterLink && (
                   <a href={userInfo.twitterLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Twitter
                    </a>
                )}
                 {userInfo.tiktokLink && (
                   <a href={userInfo.tiktokLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                       TikTok
                   </a>
                   )}
            </div>
            <button className={styles.viewProfileButton} onClick={handleViewProfile}>
                View Full Profile
             </button>
      </div>
    </div>
  );
};

export default UserCard;