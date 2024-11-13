import React from 'react';
import styles from './PreviewBanner.module.css';
import Image from 'next/image';

interface PreviewBannerProps {
  bannerUrl: string;
}

const PreviewBanner: React.FC<PreviewBannerProps> = ({ bannerUrl }) => (
  <div className={styles.bannerContainer}>
    {bannerUrl ? (
      <Image src={bannerUrl} alt="Project Banner" className={styles.bannerImage} width={200} height={200}/>
    ) : (
      <p>No banner selected</p>
    )}
  </div>
);

export default PreviewBanner;
