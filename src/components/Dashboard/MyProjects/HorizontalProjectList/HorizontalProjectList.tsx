'use client';

import React, { useRef, useState, useEffect } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import styles from './HorizontalProjectList.module.css';
import { Project } from '@/utils/interfaces';

interface HorizontalProjectListProps {
  projects: Project[];
}

const HorizontalProjectList: React.FC<HorizontalProjectListProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setShowScrollIndicator(container.scrollWidth > container.clientWidth);
      }
    };

    checkScroll();

    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [projects]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = 300; // Adjust scroll amount
      container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  return (
    <div className={styles.outerContainer}> {/* New container for background */}
      <div className={styles.projectListContainer}>
        <div className={styles.projectList} ref={containerRef}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {showScrollIndicator && (
          <div className={styles.scrollIndicator}>
            <button className={styles.scrollButton} onClick={() => handleScroll('left')}>
              {'<'}
            </button>
            <button className={styles.scrollButton} onClick={() => handleScroll('right')}>
              {'>'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalProjectList;