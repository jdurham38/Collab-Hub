import React, { useState, useEffect } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import useAllProjects from '@/hooks/projectPage/fetchAllProjects';
import ProjectFilter from '../Filter/Filter';
import styles from './ProjectGrid.module.css';
import { Project } from '@/utils/interfaces';

interface ProjectGridProps {
    userId: string | undefined;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ userId }) => {
    const { projects, loading, error } = useAllProjects(userId);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 6;
    const [isFilterVisible, setIsFilterVisible] = useState(false); // State for filter visibility

    // Get a current list of projects to display
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

     // Handle next/previous page buttons
    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [userId]);

     // Filter projects
    //TODO fix this any type 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFilterProjects = (filtered: any[]) => {
        setFilteredProjects(filtered)
    }

    useEffect(() => {
        if (projects) {
            setFilteredProjects(projects)
        }
    }, [projects])


    const toggleFilter = () => {
        setIsFilterVisible(!isFilterVisible);
    };
    const closeFilter = () => {
        setIsFilterVisible(false);
    }

    if (loading) {
        return <div className={styles.loading}>Loading projects...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    if (projects.length === 0) {
        return <div className={styles.noProjects}>No projects found.</div>;
    }
        const renderOverlay = () => {
      if (isFilterVisible) {
        return <div className={styles.overlay} onClick={closeFilter} />;
      }
      return null;
    };

    return (
        <div className={styles.container}>
           {renderOverlay()}
             <div className={styles.filterToggleButton} onClick={toggleFilter}>
               <div className={`${styles.filterIcon} ${isFilterVisible ? styles.filterIconOpen : ''}`}></div>
            </div>
             <div className={`${styles.filterContainer} ${isFilterVisible ? styles.filterVisible : ''}`}>
                <ProjectFilter projects={projects} onFilter={handleFilterProjects} />
            </div>
            <div className={styles.grid}>
                {currentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
            <div className={styles.pagination}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default ProjectGrid;