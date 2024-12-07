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

      // Check if user is the owner
      const userIsOwner = projectOwner?.created_by === userId;

      if (userIsOwner) {
        // Owner gets full privileges; you can also set them as desired
        return res.status(200).json({
          userIsOwner: true,
          adminPrivileges: true,
          canRemoveUser: true,
          canRemoveChannel: true,
          canEditProject: true,
          canCreateChannel: true, // For example, owner can also create channel
        });
      }

      // Fetch collaborator privileges if not the owner
      const { data: collaborator, error: collaboratorError } = await supabase
        .from('ProjectCollaborator')
        .select('adminPrivileges, canRemoveUser, canRemoveChannel, canEditProject')
        .eq('projectId', projectId)
        .eq('userId', userId)
        .single();

      if (collaboratorError) {
        console.error('Error fetching collaborator:', collaboratorError.message);
        return res.status(500).json({ error: 'Error fetching collaborator' });
      }

      const canCreateChannel = collaborator?.adminPrivileges || collaborator?.canEditProject || false;

      return res.status(200).json({
        userIsOwner: false,
        adminPrivileges: collaborator?.adminPrivileges ?? false,
        canRemoveUser: collaborator?.canRemoveUser ?? false,
        canRemoveChannel: collaborator?.canRemoveChannel ?? false,
        canEditProject: collaborator?.canEditProject ?? false,
        canCreateChannel,
      });
    } catch (error) {
      console.error('Error validating privileges:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
