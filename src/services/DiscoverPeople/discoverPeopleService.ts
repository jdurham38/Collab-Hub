import axios from 'axios';
import { User } from '@/utils/interfaces';

interface FetchUsersResponse {
  users: User[];
  totalCount: number;
}

interface FilterState {
  roles: string[];
  dateRange: string;
}

export const fetchUsers = async (
  page: number,
  limit: number,
  filters?: FilterState,
  searchTerm?: string,
): Promise<FetchUsersResponse> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      page,
      limit,
    };

    if (filters) {
      params.role = filters.roles.join(',');
      params.createdAt = filters.dateRange;
    }
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    const response = await axios.get('/api/users-page/users', {
      params,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch users: HTTP status ${response.status}`);
    }

    return response.data as FetchUsersResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching users:', error.message);
      throw error;
    } else if (typeof error === 'string') {
      console.error('Error fetching users:', error);
      throw new Error(error);
    } else {
      console.error('An unexpected error occurred:', error);
      throw new Error('An unexpected error occurred');
    }
  }
};
