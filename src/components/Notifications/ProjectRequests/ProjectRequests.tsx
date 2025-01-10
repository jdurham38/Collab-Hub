import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import React, { useState, useEffect } from 'react';
import projectRequestService from '@/services/Notifications/ProjectRequests/applicationRequests';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface ProjectRequest {
    projectId: string;
    userId: string;
    projectTitle?: string;
    error?: string;
    applicantUsername?: string;
    applicantRole?: string;
    creatorUsername?: string;
    creatorRole?: string;
    id?:string;
}

const ProjectRequestList: React.FC = () => {
    const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useAuthRedirect();

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError(null);

            try {
                if (user?.id) {
                    const data = await projectRequestService.fetchProjectRequests(user.id);
                    setProjectRequests(data);
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
        };

        fetchRequests();
    }, [user?.id]);

     const handleAccept = async (request: ProjectRequest) => {
        try {
            if (request.id) {
                await projectRequestService.acceptProjectRequest(request.projectId, request.userId, request.id);
            } else {
                toast.error("Request ID is missing");
                return;
            }
            toast.success('Project request accepted!');
             if(user?.id) {
                const data = await projectRequestService.fetchProjectRequests(user.id)
                setProjectRequests(data);
            }
        } catch (e) {
           if (e instanceof AxiosError) {
              toast.error(e.response?.data?.message || 'Failed to accept project request');
            } else if (e instanceof Error) {
                toast.error(e.message || 'Failed to accept project request');
            } else {
               toast.error('Failed to accept project request');
            }
        }
    };
    const handleDecline = async (requestId: string) => {
        try {
            await projectRequestService.declineProjectRequest(requestId)
            toast.success('Project request declined!');
            
            if(user?.id) {
                const data = await projectRequestService.fetchProjectRequests(user.id);
                setProjectRequests(data);
            }
        } catch (e) {
             if (e instanceof AxiosError) {
              toast.error(e.response?.data?.message || 'Failed to decline project request');
            } else if (e instanceof Error) {
                 toast.error(e.message || 'Failed to decline project request');
            } else {
              toast.error('Failed to decline project request');
            }
        }
    };


    if (loading) {
        return <p>Loading project requests...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Project Requests</h1>
            {projectRequests.length === 0 ? (
                <p>No project requests found.</p>
            ) : (
                <ul>
                    {projectRequests.map((request, index) => (
                        <li key={index}>
                            <p>
                                <strong>Project ID:</strong> {request.projectId}
                            </p>
                             <p>
                                <strong>Creator:</strong> {request.creatorUsername} ({request.creatorRole})
                            </p>
                            <p>
                                <strong>Applicant:</strong> {request.applicantUsername} ({request.applicantRole})
                            </p>
                            {request.projectTitle && (
                                <p>
                                    <strong>Project Title:</strong> {request.projectTitle}
                                </p>
                            )}
                            {request.error && (
                                <p>
                                    <strong>Error:</strong> {request.error}
                                </p>
                            )}
                            <div>
                                <button onClick={() => handleAccept(request)}>Accept</button>
                                <button onClick={() => handleDecline(request.id as string)}>Decline</button>
                            </div>
                            <hr />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProjectRequestList;