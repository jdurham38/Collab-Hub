'use client';
import React, { useState } from 'react';
import { User } from '@/utils/interfaces';
import styles from './UserCard.module.css';
import Image from 'next/image';
import ProjectInviteOverlay from '@/app/user/[id]/ProjectInviteOverlay/ProjectInviteOverlay';
interface UserCardProps {
  userInfo: User;
  onViewProfile?: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ userInfo, onViewProfile }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(userInfo.id);
    } else {
      console.log('onViewProfile is not provided, no navigation');
    }
  };
  
    const openOverlay = () => {
        setIsOverlayOpen(true);
    };
    const closeOverlay = () => {
        setIsOverlayOpen(false);
    };

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.imageContainer}>
          {userInfo.profileImageUrl && (
            <div className={styles.profileImage}>
              <Image
                src={userInfo.profileImageUrl}
                alt={`${userInfo.username}'s Profile`}
                width={80}
                height={80}
                objectFit="cover"
                className={styles.circularImage}
              />
            </div>
          )}
        </div>
        <div className={styles.textContainer}>
          <div className={styles.nameAndRole}>
            <h3 className={`${styles.username} ${styles.nameAndRoleItem}`}>
              {userInfo.username}
            </h3>
            {userInfo.role && (
              <p className={`${styles.role} ${styles.nameAndRoleItem}`}>
                {userInfo.role}
              </p>
            )}
          </div>
          {userInfo.shortBio && (
            <div className={styles.bioContainer}>
              <p className={styles.bio}>{userInfo.shortBio}</p>
            </div>
          )}
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleViewProfile}>
            View Profile
          </button>
            <button className={styles.button} onClick={openOverlay}>Invite</button>
           {isOverlayOpen && (
          <ProjectInviteOverlay receiverId={userInfo.id} onClose={closeOverlay} />
        )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;