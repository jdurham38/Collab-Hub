import React from 'react';
import styles from './PreviewBanner.module.css';
import Image from 'next/image';
import PreviewTitle from '../PreviewTitle/PreviewTitle';

interface PreviewBannerProps {
  bannerUrl: string;
  title: string;
}

const PreviewBanner: React.FC<PreviewBannerProps> = ({ bannerUrl, title }) => (
  <div className={styles.bannerContainer}>
    {bannerUrl ? (
      <Image
        src={bannerUrl}
        alt="Project Banner"
        layout="fill" // Fill the container
        objectFit="cover" // Cover the container while maintaining aspect ratio
      />
    ) : (
      <p>No banner selected</p>
    )}

    <div className={styles.titleOverlay}>
      <PreviewTitle title={title} />
    </div>
  </div>
);

export default PreviewBanner;
