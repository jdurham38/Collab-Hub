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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await handleGet(req, res);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, project_id, status } = req.query;

  try {
    let query = supabase.from('project_invites').select('*');

    if (project_id && typeof project_id === 'string') {
      query = query.eq('project_id', project_id);
    }
    if (user_id && typeof user_id === 'string') {
      query = query.or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching project invites:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
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
