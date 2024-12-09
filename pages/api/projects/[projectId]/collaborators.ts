import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!projectId || typeof projectId !== 'string') {
    console.error('Invalid project ID:', projectId);
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    const { data: collaboratorsData, error: collaboratorsError } = await supabase
      .from('ProjectCollaborator')
      .select('userId, adminPrivileges, canEditProject, canRemoveChannel, canRemoveUser, canEditAdminAccess')
      .eq('projectId', projectId);

    if (collaboratorsError) {
      console.error('Error fetching collaborators:', collaboratorsError.message);
      return res.status(500).json({ error: 'Error fetching collaborators' });
    }

    if (!collaboratorsData || collaboratorsData.length === 0) {
      return res.status(200).json({ collaborators: [] });
    }

    const userIds = collaboratorsData.map((collab) => collab.userId);

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user data:', usersError.message);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    const mergedCollaborators = collaboratorsData.map((collab) => {
      const user = usersData.find((u) => u.id === collab.userId);
      return {
        userId: collab.userId,
        adminPrivileges: collab.adminPrivileges,
        canEditProject: collab.canEditProject,
        canRemoveChannel: collab.canRemoveChannel,
        canRemoveUser: collab.canRemoveUser,
        canEditAdminAccess: collab.canEditAdminAccess,
        username: user?.username || null,
        email: user?.email || null,
      };
    });

    return res.status(200).json({
      collaborators: mergedCollaborators,
    });
  } catch (error) {
    console.error('Unexpected error fetching collaborators:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
