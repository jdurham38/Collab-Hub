import React, { useState, useEffect } from 'react';
import styles from './ProjectFilter.module.css';
import MultiSelectDropdown from './MultiSelectDropDown/MultiSelectDropDown';
import { projectRoles } from '@/utils/roles';
import { projectTags } from '@/utils/tags';
import DateSlider from './DateSlider/DateSlider';

type DateRangeValue = 0 | 1 | 7 | 30 | 'this_month' | 'last_month';


// Define a type for individual project
interface Project {
    tags: string[];
    roles: string[];
    createdAt: string; // or Date if your date from db is not a string.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; //allows other props to be passed.
}

interface ProjectFilterProps {
    projects: Project[];
    onFilter: (filteredProjects: Project[]) => void;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ projects, onFilter }) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeValue>(0);
    const [noProjectsMessage, setNoProjectsMessage] = useState<string | null>(null);

    // Extract Unique Tags and Roles
    const allTags = Object.values(projectTags).flat();
    const allRoles = Object.values(projectRoles).flat();

    useEffect(() => {
        applyFilters();
    }, [selectedTags, selectedRoles, selectedDateRange, projects]);

    const applyFilters = () => {
        let filtered = [...projects];

        // Filter by tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter((project) =>
                project.tags.some((tag) => selectedTags.includes(tag))
            );
        }

        // Filter by roles
        if (selectedRoles.length > 0) {
            filtered = filtered.filter((project) =>
                project.roles.some((role) => selectedRoles.includes(role))
            );
        }

        // Filter by Date Range
        if (selectedDateRange != null) {
            filtered = filtered.filter((project) => {
                const projectDate = new Date(project.createdAt);
                const now = new Date();
                const diffInDays = Math.floor((now.getTime() - projectDate.getTime()) / (1000 * 3600 * 24));
                console.log(
                    "projectDate:",
                    projectDate,
                    "now:",
                    now,
                    "diffInDays:",
                    diffInDays,
                    "Selected Date Range",
                    selectedDateRange,
                );
                if (selectedDateRange === 0) {
                    return (
                        projectDate.getFullYear() === now.getFullYear() &&
                        projectDate.getMonth() === now.getMonth() &&
                        projectDate.getDate() === now.getDate()
                    );
                } else if (selectedDateRange === 1) {
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    return (
                        projectDate.getFullYear() === yesterday.getFullYear() &&
                        projectDate.getMonth() === yesterday.getMonth() &&
                        projectDate.getDate() === yesterday.getDate()
                    );
                } else if (selectedDateRange === 7) {
                    return diffInDays <= 7;
                } else if (selectedDateRange === 30) {
                    return diffInDays <= 30;
                } else if (selectedDateRange === 'this_month') {
                    return projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear();
                } else if (selectedDateRange === 'last_month') {
                    const lastMonth = new Date(now);
                    lastMonth.setMonth(now.getMonth() - 1);
                    return projectDate.getMonth() === lastMonth.getMonth() && projectDate.getFullYear() === lastMonth.getFullYear();
                }
                return true;
            });
        }

        if (filtered.length === 0) {
             setNoProjectsMessage("No projects available for this filter");
        } else {
            setNoProjectsMessage(null)
        }
        onFilter(filtered);
    };

    const handleClearFilters = () => {
        setSelectedTags([]);
        setSelectedRoles([]);
        setSelectedDateRange(0);
        setNoProjectsMessage(null)
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterSection}>
                <MultiSelectDropdown
                    label="Select Tags"
                    options={allTags}
                    selected={selectedTags}
                    onSelect={setSelectedTags}
                />
            </div>
            <div className={styles.filterSection}>
                <MultiSelectDropdown
                    label="Select Roles"
                    options={allRoles}
                    selected={selectedRoles}
                    onSelect={setSelectedRoles}
                />
            </div>
            <div className={styles.filterSection}>
                <DateSlider
                    onSelect={setSelectedDateRange}
                    selected={selectedDateRange}
                />
            </div>
            <button onClick={handleClearFilters} className={styles.clearButton}>
                Clear Filters
            </button>
           {noProjectsMessage && <p>{noProjectsMessage}</p>}
        </div>
    );
};

export default ProjectFilter;