


import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId.' });
  }

  try {
        const { data: user, error } = await supabase
      .from('users')
      .select('plan, projects!projects_created_by_fkey(id)')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(500).json({ error: 'Failed to fetch user data.' });
    }

    const { plan, projects } = user;

        if (plan === 'free' && projects.length >= 3) {
      return res.status(403).json({
        error: 'Free plan users can only create or join up to 3 projects.',
      });
    }

    res.status(200).json({ message: 'Plan and project check passed.' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
