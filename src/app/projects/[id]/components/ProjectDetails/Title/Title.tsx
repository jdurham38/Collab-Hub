import React from 'react';
import styles from './Title.module.css';

interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => (
  <h1 className={styles.title}>{title}</h1>
);

export default Title;
