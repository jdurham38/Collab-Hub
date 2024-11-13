import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Async function to generate a unique 16-character alphanumeric ID
async function generateUniqueId(length = 16): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueId = '';
  let isUnique = false;

  while (!isUnique) {
    // Generate a random ID
    uniqueId = '';
    for (let i = 0; i < length; i++) {
      uniqueId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if the ID already exists in the 'projects' table
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('id', uniqueId);

    // If no data is returned, the ID is unique
    if (!data || data.length === 0) {
      isUnique = true;
    }
  }

  return uniqueId;
}

export default async function createProject(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { title, description, bannerUrl, tags, roles, userId } = req.body;

  // Optional: Input validation
  if (!title || !description || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Generate a unique project ID
    const projectId = await generateUniqueId();

    // Insert the project data into the 'projects' table
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          id: projectId, // Use the generated unique ID here
          title,
          description,
          banner_url: bannerUrl,
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
