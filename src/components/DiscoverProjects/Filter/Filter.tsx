import React, { useState, useEffect } from 'react';
import styles from './Filter.module.css';
import MultiSelectDropdown from './MultiSelectDropDown/MultiSelectDropDown';
import { projectRoles } from '@/utils/roles';
import { projectTags } from '@/utils/tags';
import Dropdown from './Dropdown/Dropdown';
import ProjectSearch from './Search/Search';


interface Project {
    tags: string[];
    roles: string[];
    createdAt: string; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; 
}

interface ProjectFilterProps {
    projects: Project[];
    onFilter: (filteredProjects: Project[]) => void;
}

interface DropdownOption {
  label: string;
  value: string;
}


const ProjectFilter: React.FC<ProjectFilterProps> = ({ projects, onFilter }) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
    const [noProjectsMessage, setNoProjectsMessage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    
    const allTags = Object.values(projectTags).flat();
    const allRoles = Object.values(projectRoles).flat();

    
    const dateRangeOptions: DropdownOption[] = [
      {label: "All Time", value: "all"},
      {label: "Today", value: "today"},
      {label: "Yesterday", value: "yesterday"},
      {label: "Last 7 Days", value: "last7days"},
      {label: "Last 30 Days", value: "last30days"},
    ]

    useEffect(() => {
        applyFilters();
    }, [selectedTags, selectedRoles, selectedDateRange, projects, searchTerm]);
    
    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }


    const applyFilters = () => {
        let filtered = [...projects];

        if(searchTerm){
            filtered = filtered.filter((project) => 
                project.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        
        if (selectedTags.length > 0) {
            filtered = filtered.filter((project) =>
                project.tags.some((tag) => selectedTags.includes(tag))
            );
        }

        
        if (selectedRoles.length > 0) {
            filtered = filtered.filter((project) =>
                project.roles.some((role) => selectedRoles.includes(role))
            );
        }

        
        if(selectedDateRange !== "all") {
          filtered = filtered.filter((project) => {
            const projectDate = new Date(project.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7)
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30)

             switch (selectedDateRange) {
               case "today":
                  return projectDate.toDateString() === today.toDateString();
               case "yesterday":
                   return projectDate.toDateString() === yesterday.toDateString();
               case "last7days":
                  return projectDate >= sevenDaysAgo && projectDate <= today;
                case "last30days":
                   return projectDate >= thirtyDaysAgo && projectDate <= today;
                default:
                  return true;
             }
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
        setSelectedDateRange("all");
        setSearchTerm('');
        setNoProjectsMessage(null)
    };

     const handleDateRangeChange = (value: string) => {
        setSelectedDateRange(value)
     }


    return (
        <div className={styles.filterContainer}>
            <ProjectSearch onSearch={handleSearch} />
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
                <Dropdown
                   label="Date Range"
                   options={dateRangeOptions}
                   selected={selectedDateRange}
                   onSelect={handleDateRangeChange}
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