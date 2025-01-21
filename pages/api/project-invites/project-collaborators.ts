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
  switch (req.method) {
    case 'GET':
      await handleGet(req, res);
      break;
    default:
      res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('ProjectCollaborator')
      .select('projectId')
      .eq('userId', user_id);


    if (error) {
      console.error('Error fetching project collaborators:', error);
      return res.status(500).json({ error: error.message });
    }


      const projectIds = data?.map((collaborator) => collaborator.projectId) || [];

    return res.status(200).json(projectIds);
  } catch (e) {
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage =
        e.message || 'An error occurred during database operation.';
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    console.error('Error during database operation:', e);
    return res.status(500).json({ error: errorMessage });
  }
}