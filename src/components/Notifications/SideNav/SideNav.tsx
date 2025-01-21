import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './SideNav.module.css';
import ProjectRequestList from '../ProjectRequests/ProjectRequests';
import ApplicationsSent from '../ApplicationsSent/ApplicationsSent';
import InvitesSent from '../ProjectInvitesSent/invitesSent';
import InvitesReceived from '../ProjectInvitesReceived/invitesReceived';
import projectRequestService from '@/services/Notifications/ProjectRequests/applicationRequests';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';

type ContentComponent = React.FC;

interface NavItem {
    title: string;
    component: ContentComponent;
    notificationType?: 'projectRequests' | 'applicationsSent' | 'invitesSent' | 'invitesReceived';
}

const SideNav: React.FC = () => {
    console.log('SideNav rendered');
    const [activeTab, setActiveTab] = useState<number>(0);
    const [notificationCounts, setNotificationCounts] = useState<{ [key: string]: number }>({});
    const user = useAuthRedirect();
    const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
    const isMounted = useRef(false);
    const [projectRequests, setProjectRequests] = useState<any[]>([]);
     const [allProjectRequests, setAllProjectRequests] = useState<any[]>([]);

    const fetchNotificationCounts = useCallback(async () => {
        if (!user?.id) return;
        console.log('fetchNotificationCounts called', user.id);
        const counts: { [key: string]: number } = {};
          try {
              if (navItems[0].notificationType) {
                  const unreadRequests = await projectRequestService.fetchUnreadProjectRequests(
                      user.id,
                  );
                  counts[navItems[0].notificationType] = unreadRequests.length;
                  setProjectRequests(unreadRequests);

                   const allRequests = await projectRequestService.fetchProjectRequests(
                      user.id,
                  );
                  setAllProjectRequests(allRequests);
              }
          } catch (error) {
            console.error("failed to get notification count", error);
          }

        setNotificationCounts(counts);
    }, [user?.id]);


    useEffect(() => {
        if (isMounted.current) {
            fetchNotificationCounts();
        } else {
            isMounted.current = true;
        }
    }, [fetchNotificationCounts]);

    useEffect(() => {
        setHasMarkedAsRead(false);
    }, [user?.id]);

    const handleTabClick = useCallback(async (index: number) => {
        setActiveTab(index);

        if (navItems[index].notificationType === 'projectRequests' && !hasMarkedAsRead && user?.id) {
            try {
                if (projectRequests.length > 0) {
                    const unreadIds = projectRequests.map((request: { id: string; }) => request.id as string);
                    await projectRequestService.markAllAsRead(unreadIds, user.id);
                    setHasMarkedAsRead(true);
                    fetchNotificationCounts();
                }
            } catch (error) {
                console.error("Failed to mark as read or refetch counts", error)
            }
        }
    }, [fetchNotificationCounts, hasMarkedAsRead, user?.id, projectRequests]);

    const navItems: NavItem[] = [
        {
            title: 'Project Requests',
            component: () => (
                <div>
                    <ProjectRequestList projectRequests={allProjectRequests} />
                </div>
            ),
            notificationType: 'projectRequests'
        },
        {
            title: 'Application Updates',
            component: () => (
                <div>
                    <ApplicationsSent />
                </div>
            ),
            notificationType: 'applicationsSent'
        },
        {
            title: 'Invites Sent',
            component: () => (
                <div>
                    <InvitesSent />
                </div>
            ),
            notificationType: 'invitesSent'
        },
        {
            title: 'Invites Received',
            component: () => (
                <div>
                    <InvitesReceived />
                </div>
            ),
            notificationType: 'invitesReceived'
        },
        {
            title: 'Friend Requests',
            component: () => <div>Friend Requests Content</div>,
        },
        {
            title: 'Project Updates',
            component: () => <div>Project Updates Content</div>,
        },
        {
            title: 'Gloabal Updates',
            component: () => <div>Global Updates Content</div>,
        },
    ];
    return (
        <div className={styles.container}>
            <div className={styles.navItems}>
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.navItem} ${activeTab === index ? styles.active : ''}`}
                        onClick={() => handleTabClick(index)}
                    >
                        {item.title}
                        {item.notificationType && notificationCounts[item.notificationType] > 0 && (
                            <span className={styles.notificationCounter}>
                                {notificationCounts[item.notificationType]}
                            </span>
                        )}
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