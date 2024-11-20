import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  bannerUrl: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ bannerUrl, title }) => {
  return (
    <div className={styles.bannerContainer}>
      <img src={bannerUrl} alt="Banner" className={styles.bannerImage} />
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
};

export default Header;
