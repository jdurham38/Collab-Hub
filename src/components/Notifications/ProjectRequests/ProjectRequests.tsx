import React, { useState, useEffect } from 'react';
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
    id?: string;
    isReadReceiver?: boolean;
}

interface ProjectRequestListProps {
    projectRequests: ProjectRequest[];
}

const ProjectRequestList: React.FC<ProjectRequestListProps> = ({ projectRequests }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (projectRequests) {
            setLoading(false);
        }
    }, [projectRequests]);

    const handleAccept = async (request: ProjectRequest) => {
        try {
            // No need to fetch requests again, SideNav will handle updates
            if (request.id) {
                //  No need to fetch requests again, SideNav will handle updates
            } else {
                toast.error('Request ID is missing');
                return;
            }
            toast.success('Project request accepted!');
        } catch (e) {
            if (e instanceof AxiosError) {
                toast.error(
                    e.response?.data?.message || 'Failed to accept project request',
                );
            } else if (e instanceof Error) {
                toast.error(e.message || 'Failed to accept project request');
            } else {
                toast.error('Failed to accept project request');
            }
        }
    };
    const handleDecline = async (requestId: string) => {
        try {
            // No need to fetch requests again, SideNav will handle updates
            toast.success('Project request declined!');
        } catch (e) {
            if (e instanceof AxiosError) {
                toast.error(
                    e.response?.data?.message || 'Failed to decline project request',
                );
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
                                <strong>Creator:</strong> {request.creatorUsername} (
                                {request.creatorRole})
                            </p>
                            <p>
                                <strong>Applicant:</strong> {request.applicantUsername} (
                                {request.applicantRole})
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
                            <p>
                                <strong>Read:</strong> {request.isReadReceiver ? 'true' : 'false'}
                            </p>
                            <div>
                                <button onClick={() => handleAccept(request)}>Accept</button>
                                <button onClick={() => handleDecline(request.id as string)}>
                                    Decline
                                </button>
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