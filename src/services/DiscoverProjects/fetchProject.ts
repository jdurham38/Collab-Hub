// --- services/DiscoverProjects/fetchProject.tsx ---
import axios from 'axios';



export const fetchFilteredProjects = async (userId: string, page: number, filters: {
    tags: string[];
    roles: string[];
    dateRange: string;
}, searchTerm: string) => {
    try {
        const response = await axios.get(
            `/api/projects-page/filter-projects?userId=${userId}&page=${page}&limit=6&tags=${filters.tags.join(',')}&roles=${filters.roles.join(',')}&dateRange=${filters.dateRange}&searchTerm=${searchTerm}`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage =
                error.response?.data?.error || 'failed to fetch projects';
            throw new Error(errorMessage);
        } else {
            throw new Error('an unexpected error has occurred');
        }
    }
};