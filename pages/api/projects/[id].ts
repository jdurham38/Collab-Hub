import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
        const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title, created_by')
      .eq('id', id)
      .single();

    if (projectError || !projectData) {
      console.error('Error fetching project:', projectError?.message || 'Project not found');
      return res.status(404).json({ error: 'Project not found' });
    }

        const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', projectData.created_by)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError?.message || 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

        return res.status(200).json({
      title: projectData.title,
      created_by: userData.username,
    });
  } catch (error) {
    console.error('Error fetching project data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
