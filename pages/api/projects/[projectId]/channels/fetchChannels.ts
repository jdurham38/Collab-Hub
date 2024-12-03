// File: /pages/api/projects/[projectId]/channels/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with server-side credentials (Service Role Key)
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '' // Ensure you use the Service Role Key for privileged operations
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  // **Step 1: Validate projectId**
  if (typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  // **Step 2: Restrict to GET method**
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // **Optional: Implement Authentication & Authorization Here**
  // Example:
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  //
  // const { user, error: authError } = await supabase.auth.api.getUser(token);
  // if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  //
  // // Further authorization checks based on user roles or project membership

  try {
    // **Step 3: Fetch Channels from Supabase**
    const { data: channels, error } = await supabase
    .from('channels')
    .select('id, name')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true }); // Optional: Order channels by creation date

    // **Step 4: Handle Supabase Errors**
    if (error) {
      console.error('Error fetching channels:', error.message);
      return res.status(500).json({ error: 'Error fetching channels' });
    }

    // **Step 5: Return Channels**
    return res.status(200).json({ channels });
  } catch (err) {
    console.error('Unexpected error fetching channels:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
