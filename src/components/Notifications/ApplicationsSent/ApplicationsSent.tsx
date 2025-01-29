import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import applicantRequestService from '@/services/Notifications/ApplicationsSent/applicationsSent';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface ApplicantProjectRequest {
    id: string;
    projectId: string;
    status: string;
    projectTitle?: string;
    error?: string;
    isReadSender?: boolean;
}

const ApplicationsSent: React.FC = () => {
    const [projectRequests, setProjectRequests] = useState<
        ApplicantProjectRequest[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useAuthRedirect();
    const isMounted = useRef(false);
    const userIdRef = useRef<string | null>(null);
    const projectRequestRef = useRef<ApplicantProjectRequest[]>([]);


    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (user?.id) {
                const data =
                    await applicantRequestService.fetchApplicantProjectRequests(
                        user.id,
                    );
                  projectRequestRef.current = data;
                setProjectRequests(data);
                userIdRef.current = user.id;
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);


   useEffect(() => {
      if (isMounted.current) {
        if (user?.id && user.id !== userIdRef.current) {
          fetchRequests();
        }
        else if (user?.id){
            setProjectRequests(projectRequestRef.current);
        }
      } else if(user?.id){
          isMounted.current = true;
       }
  }, [fetchRequests, user?.id]);

    const handleWithdraw = async (requestId: string) => {
        try {
            await applicantRequestService.deleteProjectRequest(requestId);
            toast.success('Project request withdrawn!');
                fetchRequests();
        } catch (e) {
            if (e instanceof AxiosError) {
                toast.error(
                    e.response?.data?.message || 'Failed to withdraw project request',
                );
            } else if (e instanceof Error) {
                toast.error(e.message || 'Failed to withdraw project request');
            } else {
                toast.error('Failed to withdraw project request');
            }
        }
    };

    const handleDelete = async (requestId: string) => {
        try {
            await applicantRequestService.deleteProjectRequest(requestId);
            toast.success('Project request deleted!');
           fetchRequests();
        } catch (e) {
            if (e instanceof AxiosError) {
                toast.error(
                    e.response?.data?.message || 'Failed to delete project request',
                );
            } else if (e instanceof Error) {
                toast.error(e.message || 'Failed to delete project request');
            } else {
                toast.error('Failed to delete project request');
            }
        }
    };

    if (loading) {
        return <p>Loading project applications...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Applications Sent</h1>
            {projectRequests.length === 0 ? (
                <p>No project applications found.</p>
            ) : (
                <ul>
                    {projectRequests.map((request) => (
                        <li key={request.id}>
                            <p>
                                <strong>Project Title:</strong> {request.projectTitle}
                            </p>
                            <p>
                                <strong>Status:</strong> {request.status}
                            </p>
                            {request.error && (
                                <p>
                                    <strong>Error:</strong> {request.error}
                                </p>
                            )}
                            <div>
                                {request.status === 'pending' ? (
                                    <button onClick={() => handleWithdraw(request.id)}>
                                        Withdraw
                                    </button>
                                ) : (
                                    <button onClick={() => handleDelete(request.id)}>
                                        Delete
                                    </button>
                                )}
                            </div>
                            <hr />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ApplicationsSent;