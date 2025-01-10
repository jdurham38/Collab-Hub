'use client';
import React, { useState, useEffect } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import useAllProjects from '@/hooks/projectPage/fetchAllProjects';
import ProjectFilter from '../Filter/Filter';
import styles from './ProjectGrid.module.css';
import { Project } from '@/utils/interfaces';

interface ProjectGridProps {
  userId: string | undefined;
}
interface FilterState {
  tags: string[];
  roles: string[];
  dateRange: string;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    roles: [],
    dateRange: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { projects, loading, error } = useAllProjects(
    userId,
    currentPage,
    filters,
    searchTerm,
  );
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const projectsPerPage = 6;
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [totalProjects, setTotalProjects] = useState<number>(0);

  useEffect(() => {
    if (projects) {
      setFilteredProjects(projects);
    }
  }, [projects]);

  useEffect(() => {
    const fetchTotalCount = async () => {
      if (userId) {
        try {
          const response = await fetch(
            `/api/projects-page/filter-projects?userId=${userId}&page=1&limit=1&tags=${filters.tags.join(
              ',',
            )}&roles=${filters.roles.join(',')}&dateRange=${filters.dateRange}&searchTerm=${searchTerm}`,
          );
          const data = await response.json();
          setTotalProjects(data.totalCount);
        } catch (error) {
          console.error('Error fetching total count:', error);
        }
      } else {
        setTotalProjects(0);
      }
    };
    fetchTotalCount();
  }, [userId, filters, searchTerm]);

  const totalPages = Math.ceil(totalProjects / projectsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [userId]);

  const handleFilterChange = (filterOptions: FilterState, search: string) => {
    setFilters(filterOptions);
    setSearchTerm(search);
  };

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const closeFilter = () => {
    setIsFilterVisible(false);
  };

  if (loading) {
    return <div className={styles.loading}>Loading projects...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const renderOverlay = () => {
    if (isFilterVisible) {
      return <div className={styles.overlay} onClick={closeFilter} />;
    }
    return null;
  };

  return (
    <div className={styles.gridContainer}>
      {' '}
      {}
      <div className={styles.container}>
        {renderOverlay()}
        <div className={styles.filterToggleButton} onClick={toggleFilter}>
          <div
            className={`${styles.filterIcon} ${
              isFilterVisible ? styles.filterIconOpen : ''
            }`}
          ></div>
        </div>
        <div
          className={`${styles.filterContainer} ${
            isFilterVisible ? styles.filterVisible : ''
          }`}
        >
          <ProjectFilter onFilterChange={handleFilterChange} />
        </div>
        {projects.length === 0 && filteredProjects.length === 0 && (
          <div className={styles.noProjects}>No projects found.</div>
        )}
        <div className={styles.grid}>
          {' '}
          {}
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className={styles.pagination}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectGrid;
