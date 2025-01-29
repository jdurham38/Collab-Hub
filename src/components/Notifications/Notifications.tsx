import React, { useState, useEffect } from 'react';
 import SideNav from './SideNav/SideNav';
interface NotificationsProps {
 onTotalNotificationChange?: (count: number) => void;
}
const Notifications: React.FC<NotificationsProps> = ({ onTotalNotificationChange }) => {
 const [totalNotifications, setTotalNotifications] = useState(0);

  useEffect(() => {
    if (onTotalNotificationChange) {
       onTotalNotificationChange(totalNotifications);
      }
   }, [totalNotifications, onTotalNotificationChange])

   const handleTotalNotificationChange = (count: number) => {
   setTotalNotifications(count);
 };

    return (
      <SideNav onTotalNotificationChange={handleTotalNotificationChange} />
    )
 };

export default Notifications;