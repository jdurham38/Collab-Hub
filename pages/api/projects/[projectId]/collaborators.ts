import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { User } from '@/utils/interfaces';

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
    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', projectId)
        .single();

    if (projectError) {
        console.error('Error fetching project data:', projectError.message);
        return res.status(500).json({ error: 'Error fetching project data' });
    }

      if (!projectData) {
          return res.status(404).json({error: "Project not found"})
      }

      const userIsOwner = projectData?.created_by;

    const projectOwnerId = projectData.created_by;

    const { data: collaboratorsData, error: collaboratorsError } = await supabase
      .from('ProjectCollaborator')
      .select('userId, adminPrivileges, canEditProject, canRemoveChannel, canRemoveUser, canEditAdminAccess')
      .eq('projectId', projectId);

      if (collaboratorsError) {
          console.error('Error fetching collaborators:', collaboratorsError.message);
          return res.status(500).json({ error: 'Error fetching collaborators' });
      }

      const userIds = collaboratorsData?.map((collab) => collab.userId) || [];

      const allUserIds = [...userIds, projectOwnerId];

      const {data: usersData, error: usersError} = await supabase
            .from('users')
            .select('id, username, email')
            .in('id', allUserIds)

      if (usersError) {
        console.error('Error fetching user data:', usersError.message);
          return res.status(500).json({ error: 'Error fetching user data' });
      }

    const usersMap = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
      }, {} as { [key: string]: User});


      const mergedCollaborators = collaboratorsData.map((collab) => {
          const user = usersMap[collab.userId];
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

      const projectOwner = usersMap[projectOwnerId] || { id: projectOwnerId, username: 'Unknown User', email: '' };


      return res.status(200).json({
          collaborators: mergedCollaborators,
          projectOwner: projectOwner,
          userIsOwner: userIsOwner,
      });


  } catch (error) {
    console.error('Unexpected error fetching collaborators and owner:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}