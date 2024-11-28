import { SupabaseClient } from '@supabase/supabase-js';
import axiosClient from '@/lib/axiosClient';
import axios from 'axios';


export const uploadBanner = async (
  supabase: SupabaseClient,
  bannerFile: File
): Promise<string> => {
  try {
    const fileExt = bannerFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `custom-banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-banners')
      .upload(filePath, bannerFile);

    if (uploadError) {
      throw new Error('Failed to upload banner image.');
    }

    const { data } = supabase.storage
      .from('project-banners')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Failed to get public URL of the uploaded image.');
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading banner:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred.');
  }
};

export const createProject = async (projectData: {
  title: string;
  description: string;
  bannerUrl: string;
  tags: string[];
  roles: string[];
  userId: string;
}): Promise<string> => {
  try {
    const response = await axiosClient.post('/projects/create-project', projectData);

    return response.data.projectId;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to create project.';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred.');
  }
};
