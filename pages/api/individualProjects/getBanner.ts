import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function getProjectOverview(
  req: NextApiRequest,
  res: NextApiResponse,
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
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, banner_url, title')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project data:', projectError);
      return res.status(500).json({ error: 'Failed to fetch project data.' });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error('Error processing request:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    return res.status(500).json({ error: errorMessage });
  }
}
