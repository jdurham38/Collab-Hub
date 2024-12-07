// pages/api/projects/[projectId]/channels.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('id, name')
          .eq('project_id', projectId);

        if (error) {
          console.error('Error fetching channels:', error.message);
          return res.status(500).json({ error: 'Error fetching channels' });
        }

        return res.status(200).json({ channels: data });
      } catch (err) {
        console.error('Unexpected error fetching channels:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    case 'POST':
      const { name, created_by } = req.body;

      if (!name || !created_by) {
        return res.status(400).json({ error: 'Name and created_by are required' });
      }

      try {
        const { data: projectOwner, error: ownerError } = await supabase
          .from('projects')
          .select('created_by')
          .eq('id', projectId)
          .single();

        if (ownerError) {
          console.error('Failed to validate project owner:', ownerError.message);
          return res.status(500).json({ error: 'Failed to validate project owner' });
        }

        if (projectOwner?.created_by !== created_by) {
          const { data: collaborator, error: collaboratorError } = await supabase
            .from('ProjectCollaborator')
            .select('adminPrivileges')
            .eq('projectId', projectId)
            .eq('userId', created_by)
            .single();

          if (collaboratorError || !collaborator?.adminPrivileges) {
            return res.status(403).json({ error: 'You do not have permission to create a channel.' });
          }
        }

        const { error } = await supabase.from('channels').insert([{ 
          name: name.trim(), 
          project_id: projectId, 
          created_by, 
          created_at: new Date().toISOString() 
        }]);
        
        if (error) {
          if (error.message.includes('duplicate key value violates unique constraint')) {
            return res.status(409).json({ error: 'A channel with this name already exists in this project.' });
          }
          console.error('Error adding new channel:', error.message);
          return res.status(500).json({ error: 'Error adding new channel' });
        }
        

        return res.status(201).json({ message: 'Channel added successfully' });
      } catch (err) {
        console.error('Unexpected error adding channel:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
