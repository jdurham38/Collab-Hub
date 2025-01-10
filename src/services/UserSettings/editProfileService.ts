import axios, { AxiosResponse, AxiosError } from 'axios';


export interface ProfileUpdateData {
    role?: string;
    shortBio?: string | null;
    bio?: string | null;
    personalWebsite?: string | null;
    instagramLink?: string | null;
    linkedinLink?: string | null;
    behanceLink?: string | null;
    twitterLink?: string | null;
    tiktokLink?: string | null;
    profileImageUrl?: string | null;
}


export interface ProfileUpdateResponse {
    user: {
        id: string;
        created_at: string;
        role?: string;
        shortBio?: string;
        bio?: string;
        personalWebsite?: string;
        instagramLink?: string;
        linkedinLink?: string;
        behanceLink?: string;
        twitterLink?: string;
        tiktokLink?: string;
        profileImageUrl?: string;
    };
}


export interface ProfileUpdateErrorResponse {
    error: string;
}


function handleApiError(error: AxiosError): ProfileUpdateErrorResponse {
    let errorMessage: string = 'An unexpected error occurred.';
    if (error.response) {
        
        
        errorMessage =
            (error.response.data as ProfileUpdateErrorResponse).error ||
            `API Error: ${error.response.status}`;
    } else if (error.request) {
        
        errorMessage = 'Network Error: No response received from the server.';
    } else {
        
        errorMessage = error.message;
    }
    console.error('API Error:', error);
    return { error: errorMessage };
}

const editProfileService = {
    /**
     * Retrieves user profile data via an API request.
     *
     * @param userId The ID of the user to retrieve.
     * @returns A Promise resolving to a ProfileUpdateResponse object on success or a ProfileUpdateErrorResponse object on failure.
     */
    getProfile: async (
        userId: string
    ): Promise<ProfileUpdateResponse | ProfileUpdateErrorResponse> => {
        try {
            const response: AxiosResponse<ProfileUpdateResponse> = await axios.get(
                `/api/user-settings/edit-profile?userId=${userId}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return handleApiError(error);
            }
            
            console.error('An unexpected error occurred:', error);
            return { error: 'An unexpected error occurred.' };
        }
    },

    /**
     * Updates user profile data via an API request.
     *
     * @param userId The ID of the user to update.
     * @param updateData An object containing the profile fields to update.
     * @returns A Promise resolving to a ProfileUpdateResponse object on success or a ProfileUpdateErrorResponse object on failure.
     */
    editProfile: async (
        userId: string,
        updateData: ProfileUpdateData
    ): Promise<ProfileUpdateResponse | ProfileUpdateErrorResponse> => {
        try {
            const response: AxiosResponse<ProfileUpdateResponse> =
                await axios.patch(
                    `/api/user-settings/edit-profile?userId=${userId}`,
                    updateData
                );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return handleApiError(error);
            }
            
            console.error('An unexpected error occurred:', error);
            return { error: 'An unexpected error occurred.' };
        }
    },
};

export default editProfileService;