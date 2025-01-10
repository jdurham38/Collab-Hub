'use client';
import React, { useState, useEffect } from 'react';
import { ProjectInvite, User } from '@/utils/interfaces';
import { projectInviteService } from '@/services/ProjectInvite/projectInviteService';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import Loader from '@/components/Loader/Loader';
import styles from './invitesReceived.module.css';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface InviteActions {
  status: 'accepted' | 'rejected'
  id: string
}

const InvitesReceived: React.FC = () => {
    const [invites, setInvites] = useState<ProjectInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user: User | null = useAuthRedirect();

    useEffect(() => {
        const fetchReceivedInvites = async () => {
            setLoading(true);
            if (!user?.id) {
               setLoading(false);
                setError("User session not found");
               return;
            }
            try {
                const response = await projectInviteService.listProjectInvites(
                    undefined,
                     user.id 
                );
                if (response.data) {
                    
                  const filteredInvites = response.data.filter((invite) => invite.receiver_id === user.id);
                  setInvites(filteredInvites);
                   } else {
                        setError(response.error || "Failed to fetch invites.");
                    }
            } catch (e) {
                  let errorMessage = "An unexpected error occurred.";
                  if (e instanceof Error) {
                      errorMessage = e.message || 'An error occurred while fetching received invites.';
                  } else if (typeof e === 'string') {
                       errorMessage = e;
                    }
                   setError(errorMessage);
                } finally {
                   setLoading(false);
                 }
        };

        fetchReceivedInvites();
    }, [user]);


    const handleInviteAction = async ({ id, status }: InviteActions) => {
      if (!user?.id) {
          toast.error("User session not found");
         return;
      }
        try {
            const response = await projectInviteService.updateProjectInvite(id, status, user.id);
             if (response.data) {
                
              setInvites((currentInvites) =>
                currentInvites.filter((invite) => invite.id !== id)
             );
                toast.success(
                status === 'accepted'
                   ? 'Invite accepted!'
                     : 'Invite rejected!'
                  );
             } else {
                toast.error(response.error || "Failed to update invite");
            }
        } catch (e) {
              let errorMessage = "An unexpected error occurred.";
              if (e instanceof Error) {
                  errorMessage = e.message || 'An error occurred while updating the invite.';
              } else if (typeof e === 'string') {
                  errorMessage = e;
              }
                toast.error(errorMessage);
          }
     };

     if (loading) {
          return <Loader />;
     }

    if (error) {
          return <div>Error: {error}</div>;
     }

    if (invites.length === 0) {
       return <div>No invites received.</div>;
    }


    return (
         <div className={styles.invitesContainer}>
                <h2>Invites Received</h2>
                <ul className={styles.inviteList}>
                    {invites.map((invite) => (
                       <li key={invite.id} className={styles.inviteItem}>
                            <div className={styles.inviteDetails}>
                                <p><span className={styles.label}>Project ID:</span> {invite.project_id}</p>
                                <p><span className={styles.label}>Sender ID:</span> {invite.sender_id}</p>
                                <p><span className={styles.label}>Status:</span> {invite.status}</p>
                                <p><span className={styles.label}>Sent At:</span> {format(new Date(invite.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                                {invite.expires_at && (
                                    <p><span className={styles.label}>Expires At:</span> {format(new Date(invite.expires_at), 'MMM dd, yyyy hh:mm a')}</p>
                                )}
                            </div>
                           {invite.status === 'pending' && (
                            <div className={styles.inviteActions}>
                                <button className={styles.acceptButton} onClick={() => handleInviteAction({id: invite.id, status: 'accepted'})}>Accept</button>
                                <button className={styles.rejectButton} onClick={() => handleInviteAction({id: invite.id, status: 'rejected'})}>Reject</button>
                           </div>
                         )}
                       </li>
                    ))}
                </ul>
            </div>
    );
};

export default InvitesReceived;