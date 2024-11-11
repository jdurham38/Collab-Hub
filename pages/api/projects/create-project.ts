// pages/api/projects/create-project.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to generate a unique 16-character alphanumeric ID
function generateUniqueId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function createProject(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { title, description, bannerUrl, tags, roles, userId } = req.body; // Changed 'banner' to 'bannerUrl'
  const projectId = generateUniqueId(); // Generate the unique ID for the project

  // Optional: Input validation
  if (!title || !description || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Insert the project data into the 'projects' table
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          id: projectId, // Use the generated ID here
          title,
          description,
          banner_url: bannerUrl, // Changed 'banner' to 'banner_url' and assigned 'bannerUrl'
          tags,
          roles,
          created_by: userId,
        },
      ])
      .select('id');

    if (error) throw error;

    if (!data || data.length === 0) throw new Error('Failed to retrieve project ID.');

    return res.status(200).json({ projectId: data[0].id });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}
