'use client'
import React, { useState } from 'react';
import { Project } from '@/utils/interfaces';
import styles from './ProjectCard.module.css';
import ProjectPreview from '../PreviewProjectModal/PreviewProjectModal';
import DOMPurify from 'dompurify';
import useApplyProject from '@/hooks/projectPage/useApplyProject';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';


interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const user = useAuthRedirect();
    const userId = user?.id || null; 
    const { isApplying, hasApplied, apply, error, isLoading } = useApplyProject(project.id, userId);

    const handleReadMore = () => {
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
    };

    const truncateDescription = (htmlDescription: string, maxLength: number) => {
        const sanitizedHTML = DOMPurify.sanitize(htmlDescription);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedHTML;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        if (textContent.length <= maxLength) {
            return sanitizedHTML;
        }
        const truncatedText = textContent.substring(0, maxLength);
        const lastSpaceIndex = truncatedText.lastIndexOf(' ');

        const truncatedDescription = textContent.substring(0, lastSpaceIndex) + '...';
        tempDiv.innerHTML = truncatedDescription;
        return tempDiv.innerHTML;
    };

    const sanitizedDescription = DOMPurify.sanitize(project.description);
    const truncatedDescription = truncateDescription(sanitizedDescription, 25);

    const handleApply = async () => {
      if (user) {
        await apply(project.id, user.id);
      } else {
        console.error('User is not authenticated.');
       
      }
    };



    return (
        <div className={styles.card}>
            {isPreviewOpen && (
                <ProjectPreview project={project} onClose={handleClosePreview} />
            )}
            <img src={project.banner_url} alt={project.title} className={styles.banner} />
            <div className={styles.info}>
                <h3 className={styles.title}>{project.title}</h3>
                <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: truncatedDescription }}
                />
                {project.description.length > 25 && <button className={styles.readMore} onClick={handleReadMore}>Read More</button>}
                <div className={styles.tags}>
                    {project.roles.map((role) => (
                        <span key={role} className={styles.tag}>
                            {role}
                        </span>
                    ))}
                </div>
                <div className={styles.tags}>
                    {project.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>
                <div className={styles.cardActions}>
                      {isLoading ? (
                            <span className={styles.loadingText}>Loading...</span>
                        ) : hasApplied === null || hasApplied === false ? (
                        <button onClick={handleApply} disabled={isApplying} className={styles.applyButton}>
                           {isApplying ? 'Applying...' : 'Apply'}
                         </button>
                        ) : (
                         <span className={styles.appliedText}>Applied</span>
                        )}
                         {error && <p className={styles.errorMessage}>Error: {error}</p>}
                  </div>
                <p className={styles.createdBy}>
                    Created by: {project.created_by_username}
                </p>
            </div>
        </div>
    );
};

export default ProjectCard;