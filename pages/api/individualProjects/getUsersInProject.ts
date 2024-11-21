import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function getUsersInProject(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res
      .status(400)
      .json({ error: 'Missing or invalid projectId parameter.' });
  }

  try {
    // Fetch the project and owner using the foreign key relationship
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        id,
        title,
        description,
        banner_url,
        tags,
        roles,
        users:users!projects_created_by_fkey (
          id,
          email,
          username,
          createdAt
        )
      `
      )
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project data:', projectError);
      return res.status(500).json({ error: 'Failed to fetch project data.' });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Access the owner information
    const owner = project.users;

    // Fetch collaborators from 'ProjectCollaborator' table
    const { data: collaborators, error: collaboratorsError } = await supabase
      .from('ProjectCollaborator')
      .select(
        `
        userId,
        users (
          id,
          email,
          username,
          createdAt
        )
      `
      )
      .eq('projectId', projectId);

    if (collaboratorsError) {
      console.error('Error fetching collaborators:', collaboratorsError);
      return res.status(500).json({ error: 'Failed to fetch collaborators.' });
    }

    // Extract collaborator user information
    const users = collaborators?.map((collaborator) => collaborator.users) || [];

    return res.status(200).json({ owner, users });
  } catch (error) {
    console.error('Error processing request:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    return res.status(500).json({ error: errorMessage });
  }
}
