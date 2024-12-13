// pages/api/projects/[projectId]/collaborators/[userId].ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
interface ProjectCollaboratorUpdate {
  adminPrivileges?: boolean;
  canRemoveUser?: boolean;
  canRemoveChannel?: boolean;
  canEditProject?: boolean;
  canEditAdminAccess?: boolean;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, userId } = req.query;

  if (typeof projectId !== 'string' || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID or user ID' });
  }

  if (req.method === 'DELETE') {
    const { requesterId } = req.body || {};

    if (!requesterId) {
      return res.status(400).json({ error: 'Missing requesterId in request body' });
    }

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', projectId)
        .single();

      if (projectError) {
        return res.status(500).json({ error: 'Error fetching project owner' });
      }

      const userIsOwner = projectData?.created_by === requesterId;

      let requesterCanRemoveUser = false;
      if (!userIsOwner) {
        const { data: requesterCollab, error: requesterError } = await supabase
          .from('ProjectCollaborator')
          .select('canRemoveUser')
          .eq('projectId', projectId)
          .eq('userId', requesterId)
          .single();

        if (requesterError) {
          return res.status(500).json({ error: 'Error fetching requester privileges' });
        }

        requesterCanRemoveUser = requesterCollab?.canRemoveUser ?? false;
      }

      if (!userIsOwner && !requesterCanRemoveUser) {
        return res.status(403).json({ error: 'You do not have permission to remove collaborators.' });
      }

      if (userIsOwner && userId === requesterId) {
        return res.status(400).json({ error: 'Project owner cannot be removed.' });
      }

      const { error: deleteError } = await supabase
        .from('ProjectCollaborator')
        .delete()
        .eq('projectId', projectId)
        .eq('userId', userId);

      if (deleteError) {
        return res.status(500).json({ error: 'Error removing collaborator' });
      }

      return res.status(200).json({ message: 'Collaborator removed successfully.' });
    } catch (err) {
      // Handle generic error
      if (err instanceof Error) {
        // If it's an Error object, you can access err.message
        return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
      } else {
        // If it's not an Error object, handle it differently
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } else if (req.method === 'PATCH') {
    const { adminPrivileges, canRemoveUser, canRemoveChannel, canEditProject, canEditAdminAccess } = req.body;

    // Use the defined type for updateData
    const updateData: ProjectCollaboratorUpdate = {};

    if (adminPrivileges !== undefined) {
      if (typeof adminPrivileges !== 'boolean') {
        return res.status(400).json({ error: 'Invalid adminPrivileges value' });
      }
      updateData.adminPrivileges = adminPrivileges;

      // If adminPrivileges is true, set all other permissions to true as well
      if (adminPrivileges) {
        updateData.canRemoveUser = true;
        updateData.canRemoveChannel = true;
        updateData.canEditProject = true;
        updateData.canEditAdminAccess = true;
      }
    }

    // Only update these fields if adminPrivileges is not explicitly set to true
    if (adminPrivileges !== true) {
      if (typeof canRemoveUser === 'boolean') {
        updateData.canRemoveUser = canRemoveUser;
      }
      if (typeof canRemoveChannel === 'boolean') {
        updateData.canRemoveChannel = canRemoveChannel;
      }
      if (typeof canEditProject === 'boolean') {
        updateData.canEditProject = canEditProject;
      }
      if (typeof canEditAdminAccess === 'boolean') {
        updateData.canEditAdminAccess = canEditAdminAccess;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    try {
      const { data, error } = await supabase
        .from('ProjectCollaborator')
        .update(updateData)
        .eq('projectId', projectId)
        .eq('userId', userId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error updating privileges' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Collaborator not found' });
      }

      return res.status(200).json({ collaborator: data, message: 'Privileges updated successfully.' });
    } catch (err) {
      // Handle generic error
      if (err instanceof Error) {
        return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
      } else {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
