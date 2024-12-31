

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '' 
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  
  if (typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  try {
    
    const { data: channels, error } = await supabase
    .from('channels')
    .select('id, name')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true }); 

    
    if (error) {
      console.error('Error fetching channels:', error.message);
      return res.status(500).json({ error: 'Error fetching channels' });
    }

    
    return res.status(200).json({ channels });
  } catch (err) {
    console.error('Unexpected error fetching channels:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
