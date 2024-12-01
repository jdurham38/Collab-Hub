// pages/api/projects/[projectId]/validatePrivileges.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const { userId } = req.body;

  if (typeof projectId !== 'string' || !userId) {
    return res.status(400).json({ error: 'Invalid project ID or user ID' });
  }

  if (req.method === 'POST') {
    try {
      const { data: projectOwner, error: ownerError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', projectId)
        .single();

      if (ownerError) {
        console.error('Error fetching project owner:', ownerError.message);
        return res.status(500).json({ error: 'Error fetching project owner' });
      }

      if (projectOwner?.created_by === userId) {
        return res.status(200).json({ canCreateChannel: true });
      }

      const { data: collaborator, error: collaboratorError } = await supabase
        .from('ProjectCollaborator')
        .select('adminPrivileges')
        .eq('projectId', projectId)
        .eq('userId', userId)
        .single();

      if (collaboratorError) {
        console.error('Error fetching collaborator:', collaboratorError.message);
        return res.status(500).json({ error: 'Error fetching collaborator' });
      }

      const canCreateChannel = collaborator?.adminPrivileges || false;
      return res.status(200).json({ canCreateChannel });
    } catch (error) {
      console.error('Error validating privileges:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
