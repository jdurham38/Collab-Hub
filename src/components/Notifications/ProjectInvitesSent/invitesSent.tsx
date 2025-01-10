'use client';
import React, { useState, useEffect } from 'react';
import { ProjectInvite, User } from '@/utils/interfaces';
import { projectInviteService } from '@/services/ProjectInvite/projectInviteService';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import Loader from '@/components/Loader/Loader';
import styles from './invitesSent.module.css';
import { format } from 'date-fns';

const InvitesSent: React.FC = () => {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user: User | null = useAuthRedirect();

  useEffect(() => {
    const fetchSentInvites = async () => {
      setLoading(true);
      if (!user?.id) {
        setLoading(false);
        setError('User session not found');
        return;
      }
      try {
        const response = await projectInviteService.listProjectInvites(
          undefined,
          user.id,
        );
        if (response.data) {
          const filteredInvites = response.data.filter(
            (invite) => invite.sender_id === user.id,
          );
          setInvites(filteredInvites);
        } else {
          setError(response.error || 'Failed to fetch invites.');
        }
      } catch (e) {
        let errorMessage = 'An unexpected error occurred.';
        if (e instanceof Error) {
          errorMessage =
            e.message || 'An error occurred while fetching sent invites.';
        } else if (typeof e === 'string') {
          errorMessage = e;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSentInvites();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (invites.length === 0) {
    return <div>No invites have been sent.</div>;
  }

  return (
    <div className={styles.invitesContainer}>
      <h2>Invites Sent</h2>
      <ul className={styles.inviteList}>
        {invites.map((invite) => (
          <li key={invite.id} className={styles.inviteItem}>
            <div className={styles.inviteDetails}>
              <p>
                <span className={styles.label}>Project ID:</span>{' '}
                {invite.project_id}
              </p>
              <p>
                <span className={styles.label}>Receiver ID:</span>{' '}
                {invite.receiver_id}
              </p>
              <p>
                <span className={styles.label}>Status:</span> {invite.status}
              </p>
              <p>
                <span className={styles.label}>Sent At:</span>{' '}
                {format(new Date(invite.created_at), 'MMM dd, yyyy hh:mm a')}
              </p>
              {invite.expires_at && (
                <p>
                  <span className={styles.label}>Expires At:</span>{' '}
                  {format(new Date(invite.expires_at), 'MMM dd, yyyy hh:mm a')}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvitesSent;
