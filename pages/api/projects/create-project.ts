import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function createProject(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { title, description, bannerUrl, tags, roles, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan, projects!projects_created_by_fkey(id)')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw userError;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { plan, projects } = user;
    if (plan === 'free' && projects.length >= 3) {
      return res
        .status(403)
        .json({ error: 'Free plan users can only create up to 3 projects.' });
    }

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          banner_url: bannerUrl,
          tags,
          roles,
          created_by: userId,
        },
      ])
      .select('id')
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return res.status(500).json({ error: 'Failed to create project.' });
    }

    return res.status(200).json({ projectId: projectData.id });
  } catch (error) {
    console.error('Error processing request:', error);

    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
}
