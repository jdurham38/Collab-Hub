import React from 'react';
import styles from './PreviewTitle.module.css';

interface PreviewTitleProps {
  title: string;
}

const PreviewTitle: React.FC<PreviewTitleProps> = ({ title }) => (
  <h1 className={styles.title}>{title}</h1>
);

export default PreviewTitle;
