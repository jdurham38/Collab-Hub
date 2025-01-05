import axios from 'axios';
import { User } from '@/utils/interfaces'; 

interface FetchUsersResponse {
    users: User[];
    totalCount: number;
}

export const fetchUsers = async (
    page: number,
    limit: number,
    userId?: string
): Promise<FetchUsersResponse> => {
    try {
        const response = await axios.get('/api/users-page/users', {
            params: {
                page,
                limit,
                userId,
            },
        });

        if (response.status !== 200) {
            throw new Error(`Failed to fetch users: HTTP status ${response.status}`);
        }

        return response.data as FetchUsersResponse;


    } catch (error) {
      if (error instanceof Error) {
            console.error('Error fetching users:', error.message);
          throw error;
      } else if (typeof error === 'string'){
            console.error('Error fetching users:', error);
        throw new Error(error)
        }
        else {
            console.error('An unexpected error occurred:', error);
            throw new Error("An unexpected error occurred")
        }
    }
};