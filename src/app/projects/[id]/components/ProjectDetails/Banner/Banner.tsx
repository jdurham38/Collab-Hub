import React from 'react';
import styles from './Banner.module.css';
import Image from 'next/image';
import Title from '../Title/Title';
interface ProjectBannerProps {
  bannerUrl: string;
  title: string;
}

const ProjectBanner: React.FC<ProjectBannerProps> = ({ bannerUrl, title }) => (
  <div className={styles.bannerContainer}>
    {bannerUrl ? (
      <Image
        src={bannerUrl}
        alt="Project Banner"
        className={styles.bannerImage}
        fill
        style={{objectFit: 'cover'}}
        priority
      />
    ) : (
      <p>No banner selected</p>
    )}

    <div className={styles.titleOverlay}>
      <Title title={title} />
    </div>
  </div>
);

export default ProjectBanner;
