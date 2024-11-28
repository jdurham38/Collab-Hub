// File: pages/api/projects/[id]/collaborators.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    // Fetch collaborators for the project
    const { data: collaboratorsData, error: collaboratorsError } = await supabase
      .from('ProjectCollaborator')
      .select('userId')
      .eq('projectId', id);

    if (collaboratorsError) {
      console.error('Error fetching collaborators:', collaboratorsError.message);
      return res.status(500).json({ error: 'Error fetching collaborators' });
    }

    if (!collaboratorsData || collaboratorsData.length === 0) {
      return res.status(200).json({ collaborators: [] });
    }

    const userIds = collaboratorsData.map((collab) => collab.userId);

    // Fetch user information for these userIds
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user data:', usersError.message);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    return res.status(200).json({
      collaborators: usersData,
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
