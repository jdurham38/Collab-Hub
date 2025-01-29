import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './SideNav.module.css';
import ProjectRequestList from '../ProjectRequests/ProjectRequests';
import ApplicationsSent from '../ApplicationsSent/ApplicationsSent';
import InvitesSent from '../ProjectInvitesSent/invitesSent';
import InvitesReceived from '../ProjectInvitesReceived/invitesReceived';
import projectRequestService from '@/services/Notifications/ProjectRequests/applicationRequests';
import applicantRequestService from '@/services/Notifications/ApplicationsSent/applicationsSent';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import projectInviteNotificationService from '@/services/Notifications/projectInviteNotificationService';

type ContentComponent = React.FC;

interface NavItem {
    title: string;
    component: ContentComponent;
    notificationType?: 'projectRequests' | 'applicationsSent' | 'invitesSent' | 'invitesReceived';
}
interface SideNavProps {
    onTotalNotificationChange: (count: number) => void;
}

const SideNav: React.FC<SideNavProps> = ({ onTotalNotificationChange }) => {
    console.log('SideNav rendered');
    const [activeTab, setActiveTab] = useState<number>(0);
    const [notificationCounts, setNotificationCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const user = useAuthRedirect();
    const [hasMarkedAsRead, setHasMarkedAsRead] = useState({ projectRequests: false, applicationsSent: false, invitesReceived: false, invitesSent: false });
    const [projectRequests, setProjectRequests] = useState<any[]>([]);
    const [allProjectRequests, setAllProjectRequests] = useState<any[]>([]);
    const [applicationsSent, setApplicationsSent] = useState<any[]>([]);
    const [invitesReceived, setInvitesReceived] = useState<any[]>([]);
    const [invitesSent, setInvitesSent] = useState<any[]>([]);
    const isMounted = useRef(false);
    const userIdRef = useRef<string | null>(null);
    const notificationCountRef = useRef<{ [key: string]: number }>({});
    const navItems: NavItem[] = [
        {
            title: 'Project Requests',
            component: () => (
                <div>
                    <ProjectRequestList
                        projectRequests={allProjectRequests}
                        onProjectRequestChange={handleProjectRequestChange}
                    />
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
                    <InvitesReceived onInvitesChange={handleInviteChange} />
                </div>
            ),
            notificationType: 'invitesReceived'
        },
        
        {
            title: 'Gloabal Updates',
            component: () => <div>Global Updates Content</div>,
        },
    ];

    const fetchNotificationData = useCallback(async (userId: string) => {
        console.log('fetchNotificationData called', userId);
        const counts: { [key: string]: number } = {};
        try {
            // Using Promise.all to fetch data concurrently
            await Promise.all([
                (async () => {
                    if (navItems[0].notificationType) {
                        const unreadRequests = await projectRequestService.fetchUnreadProjectRequests(
                            userId,
                        );
                        counts[navItems[0].notificationType] = unreadRequests.length;
                        setProjectRequests(unreadRequests);
                        const allRequests = await projectRequestService.fetchProjectRequests(
                            userId,
                        );
                        setAllProjectRequests(allRequests);
                    }

                })(),
                (async () => {
                    if (navItems[1].notificationType) {
                        const unreadApplications =
                            await applicantRequestService.fetchUnreadApplicantProjectRequests(
                                userId,
                            );
                        counts[navItems[1].notificationType] = unreadApplications.length;
                        setApplicationsSent(unreadApplications);
                    }
                })(),
                (async () => {
                    if (navItems[3].notificationType) {
                        const unreadInvites =
                            await projectInviteNotificationService.fetchUnreadProjectInvites(
                                userId,
                            );
                        counts[navItems[3].notificationType] = unreadInvites.length;
                        setInvitesReceived(unreadInvites)
                    }
                })(),
                (async () => {
                    if (navItems[2].notificationType) {
                        const unreadSentInvites =
                            await projectInviteNotificationService.fetchUnreadSentProjectInvites(
                                userId,
                            );
                        counts[navItems[2].notificationType] = unreadSentInvites.length;
                        setInvitesSent(unreadSentInvites);
                    }
                })()
            ]);

            userIdRef.current = userId;
            notificationCountRef.current = counts;
            setNotificationCounts(counts);
             const totalCount = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
             onTotalNotificationChange(totalCount);
        } catch (error) {
            console.error("failed to get notification count", error);
        }
        finally {
            setLoading(false); // Mark loading as false after everything is done
        }
    }, [onTotalNotificationChange]);


    useEffect(() => {
        if (!user?.id) return;

        if (isMounted.current) {
            if (user?.id && user.id !== userIdRef.current) {
                setLoading(true)
                fetchNotificationData(user.id)

            }
            else if (user?.id) {
                setNotificationCounts(notificationCountRef.current);
            }
        } else if (user?.id) {
            isMounted.current = true;
            setLoading(true)
            fetchNotificationData(user.id); //Initial data fetch
        }
    }, [fetchNotificationData, user?.id]);

    useEffect(() => {
        setHasMarkedAsRead({ projectRequests: false, applicationsSent: false, invitesReceived: false, invitesSent: false });
    }, [user?.id]);

    const handleProjectRequestChange = useCallback(() => {
        if (user?.id) {
            setLoading(true)
            fetchNotificationData(user.id);
        }
    }, [fetchNotificationData, user?.id]);

    const handleInviteChange = useCallback(() => {
        if (user?.id) {
            setLoading(true)
            fetchNotificationData(user.id);
        }
    }, [fetchNotificationData, user?.id]);

    const handleTabClick = useCallback(async (index: number) => {
        setActiveTab(index);
        let newNotificationCounts = { ...notificationCounts }

        if (navItems[index].notificationType === 'projectRequests' && !hasMarkedAsRead.projectRequests && user?.id) {
            try {
                if (projectRequests.length > 0) {
                    const unreadIds = projectRequests.map((request: { id: string; }) => request.id as string);
                    await projectRequestService.markAllAsRead(unreadIds, user.id);
                    setHasMarkedAsRead((prev) => ({ ...prev, projectRequests: true }));
                    newNotificationCounts = {
                        ...newNotificationCounts,
                        projectRequests: 0,
                    };
                    setNotificationCounts(newNotificationCounts);
                }
            } catch (error) {
                console.error("Failed to mark as read or refetch counts", error)
            }
        }
        if (navItems[index].notificationType === 'applicationsSent' && !hasMarkedAsRead.applicationsSent && user?.id) {
            try {
                if (applicationsSent.length > 0) {
                    const unreadIds = applicationsSent.map((request: { id: string; }) => request.id as string);
                    await applicantRequestService.markAllAsRead(unreadIds, user.id)
                    setHasMarkedAsRead((prev) => ({ ...prev, applicationsSent: true }));
                    newNotificationCounts = {
                        ...newNotificationCounts,
                        applicationsSent: 0,
                    };
                    setNotificationCounts(newNotificationCounts);
                }
            } catch (error) {
                console.error("Failed to mark as read or refetch counts", error)
            }
        }
        if (navItems[index].notificationType === 'invitesReceived' && !hasMarkedAsRead.invitesReceived && user?.id) {
            try {
                if (invitesReceived.length > 0) {
                    const unreadIds = invitesReceived.map((invite: { id: string; }) => invite.id as string);
                    await projectInviteNotificationService.markAllAsRead(unreadIds, user.id)
                    setHasMarkedAsRead((prev) => ({ ...prev, invitesReceived: true }));
                    newNotificationCounts = {
                        ...newNotificationCounts,
                        invitesReceived: 0,
                    };
                    setNotificationCounts(newNotificationCounts);
                }
            } catch (error) {
                console.error("Failed to mark as read or refetch counts", error)
            }
        }
        if (navItems[index].notificationType === 'invitesSent' && !hasMarkedAsRead.invitesSent && user?.id) {
            try {
                if (invitesSent.length > 0) {
                    const unreadIds = invitesSent.map((invite: { id: string; }) => invite.id as string);
                    await projectInviteNotificationService.markAllSentAsRead(unreadIds, user.id)
                    setHasMarkedAsRead((prev) => ({ ...prev, invitesSent: true }));
                    newNotificationCounts = {
                        ...newNotificationCounts,
                        invitesSent: 0,
                    };
                    setNotificationCounts(newNotificationCounts);
                }
            } catch (error) {
                console.error("Failed to mark as read or refetch counts", error)
            }
        }
    }, [hasMarkedAsRead, user?.id, applicationsSent, projectRequests, notificationCounts, invitesReceived, invitesSent]);


    if (loading) return <div>Loading Notifications...</div>;

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