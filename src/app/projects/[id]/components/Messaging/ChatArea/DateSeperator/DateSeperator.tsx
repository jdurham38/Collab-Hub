import React from 'react';
import styles from './DateSeparator.module.css';

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  let displayDate = '';

  if (isToday) {
    displayDate = 'Today';
  } else if (isYesterday) {
    displayDate = 'Yesterday';
  } else {
    displayDate = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return <div className={styles.dateSeparator}>{displayDate}</div>;
};

export default DateSeparator;
