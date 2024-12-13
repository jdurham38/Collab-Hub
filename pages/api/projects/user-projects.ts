import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const userId = req.query.userId;

  // Ensure userId is a single string, not an array
  if (Array.isArray(userId)) {
    return res.status(400).json({ error: 'Only one userId parameter is allowed' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, createdAt')
      .eq('created_by', userId);

    if (error) {
      console.error('Error fetching user projects:', error.message);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}