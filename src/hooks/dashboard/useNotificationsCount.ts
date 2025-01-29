// hooks/notifications/useNotificationCount.ts
import { useState, useEffect, useCallback } from 'react';
import projectRequestService from '@/services/Notifications/ProjectRequests/applicationRequests';
import applicantRequestService from '@/services/Notifications/ApplicationsSent/applicationsSent';
import projectInviteNotificationService from '@/services/Notifications/projectInviteNotificationService';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';


interface NavItem {
    title: string;
     notificationType?: 'projectRequests' | 'applicationsSent' | 'invitesSent' | 'invitesReceived';
}

const navItems: NavItem[] = [
      {
          title: 'Project Requests',
           notificationType: 'projectRequests'
      },
     {
          title: 'Application Updates',
           notificationType: 'applicationsSent'
     },
     {
          title: 'Invites Sent',
           notificationType: 'invitesSent'
     },
     {
          title: 'Invites Received',
           notificationType: 'invitesReceived'
     },

];

const useNotificationCount = () => {
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [loading, setLoading] = useState(true);
    const user = useAuthRedirect();

    const fetchNotificationData = useCallback(async (userId: string) => {
        console.log('fetchNotificationData called', userId);
        const counts: { [key: string]: number } = {};
        try {
            await Promise.all([
                (async () => {
                    if (navItems[0].notificationType) {
                        const unreadRequests = await projectRequestService.fetchUnreadProjectRequests(
                            userId,
                        );
                        counts[navItems[0].notificationType] = unreadRequests.length;
                    }

                })(),
                (async () => {
                    if (navItems[1].notificationType) {
                        const unreadApplications =
                            await applicantRequestService.fetchUnreadApplicantProjectRequests(
                                userId,
                            );
                        counts[navItems[1].notificationType] = unreadApplications.length;
                    }
                })(),
                (async () => {
                    if (navItems[3].notificationType) {
                        const unreadInvites =
                            await projectInviteNotificationService.fetchUnreadProjectInvites(
                                userId,
                            );
                        counts[navItems[3].notificationType] = unreadInvites.length;
                    }
                })(),
                (async () => {
                    if (navItems[2].notificationType) {
                        const unreadSentInvites =
                            await projectInviteNotificationService.fetchUnreadSentProjectInvites(
                                userId,
                            );
                        counts[navItems[2].notificationType] = unreadSentInvites.length;
                    }
                })()
            ]);
            const totalCount = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
            setTotalNotifications(totalCount);
        } catch (error) {
            console.error("failed to get notification count", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if(user?.id) {
             setLoading(true);
           fetchNotificationData(user.id);
        }
    }, [fetchNotificationData, user?.id]);

    return { totalNotifications, loading };
};

export default useNotificationCount;