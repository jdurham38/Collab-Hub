import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { projectId, userId } = req.body;

  if (!projectId || !userId) {
    return res
      .status(400)
      .json({ message: 'projectId and userId are required' });
  }

  try {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) {
      console.error(
        'Error fetching project data:',
        projectError?.message || 'Project not found',
      );
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectData.created_by === userId) {
      return res.status(400).json({
        message: 'Project owner cannot apply to their own project.',
      });
    }

    const { data, error } = await supabase.from('ProjectRequest').insert([
      {
        projectId: projectId,
        userId: userId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error inserting project request', error.message);
      return res
        .status(500)
        .json({ error: 'Failed to create project request' });
    }

    return res
      .status(201)
      .json({ message: 'Application submitted successfully', data: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
