import React, { useState } from 'react';
import styles from './SideNav.module.css';
import ProjectRequestList from '../ProjectRequests/ProjectRequests';
import ApplicationsSent from '../ApplicationsSent/ApplicationsSent';
import InvitesSent from '../ProjectInvitesSent/invitesSent';
import InvitesReceived from '../ProjectInvitesReceived/invitesReceived';

type ContentComponent = React.FC;

interface NavItem {
  title: string;
  component: ContentComponent;
}

const SideNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0); // Start with Project Requests active

  const navItems: NavItem[] = [
    { title: 'Project Requests', component: () => <div><ProjectRequestList/></div> }, // Dummy component
    { title: 'Application Updates', component: () => <div><ApplicationsSent /></div> }, // Dummy component
    { title: 'Invites Sent', component: () => <div><InvitesSent /></div> }, // Dummy component
    { title: 'Invites Received', component: () => <div><InvitesReceived /></div> }, // Dummy component
    { title: 'Friend Requests', component: () => <div>Friend Requests Content</div> }, // Dummy component
    { title: 'Project Updates', component: () => <div>Project Updates Content</div> }, // Dummy component
    { title: 'Gloabal Updates', component: () => <div>Global Updates Content</div> }, // Dummy component
  ];

  return (
    <div className={styles.container}>
      <div className={styles.navItems}>
      {navItems.map((item, index) => (
        <div
          key={index}
          className={`${styles.navItem} ${activeTab === index ? styles.active : ''}`}
          onClick={() => setActiveTab(index)}
        >
          {item.title}
        </div>
      ))}
        </div>

      <div className={styles.contentContainer}>
        {React.createElement(navItems[activeTab].component)}
      </div>
    </div>
  );
};

export default SideNav;