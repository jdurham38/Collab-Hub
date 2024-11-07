import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch all projects created by the specified user, ensuring userId is treated as a UUID
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, createdAt')
      .eq('created_by', userId as string); // Ensure userId is treated as a string/UUID

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
