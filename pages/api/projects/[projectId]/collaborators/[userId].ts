import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
      // Fetch project owner
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project owner:', projectError.message);
        return res.status(500).json({ error: 'Error fetching project owner' });
      }

      const userIsOwner = projectData?.created_by === requesterId;

      // If not owner, check if requester has canRemoveUser privilege
      let requesterCanRemoveUser = false;
      if (!userIsOwner) {
        const { data: requesterCollab, error: requesterError } = await supabase
          .from('ProjectCollaborator')
          .select('canRemoveUser')
          .eq('projectId', projectId)
          .eq('userId', requesterId)
          .single();

        if (requesterError) {
          console.error('Error fetching requester privileges:', requesterError.message);
          return res.status(500).json({ error: 'Error fetching requester privileges' });
        }

        requesterCanRemoveUser = requesterCollab?.canRemoveUser ?? false;
      }

      // If the requester is neither owner nor has canRemoveUser privilege, deny
      if (!userIsOwner && !requesterCanRemoveUser) {
        return res.status(403).json({ error: 'You do not have permission to remove collaborators.' });
      }

      // Prevent removing the project owner
      if (userIsOwner && userId === requesterId) {
        return res.status(400).json({ error: 'Project owner cannot be removed.' });
      }

      // Proceed to remove the collaborator
      const { error: deleteError } = await supabase
        .from('ProjectCollaborator')
        .delete()
        .eq('projectId', projectId)
        .eq('userId', userId);

      if (deleteError) {
        console.error('Error removing collaborator:', deleteError.message);
        return res.status(500).json({ error: 'Error removing collaborator' });
      }

      return res.status(200).json({ message: 'Collaborator removed successfully.' });
    } catch (err) {
      console.error('Unexpected error removing collaborator:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PATCH') {
    const { adminPrivileges, canRemoveUser, canRemoveChannel, canEditProject } = req.body;

    // Validate input types
    if (typeof adminPrivileges !== 'boolean') {
      return res.status(400).json({ error: 'Invalid adminPrivileges value' });
    }

    let updateData: any = { adminPrivileges };

    if (adminPrivileges) {
      updateData.canRemoveUser = true;
      updateData.canRemoveChannel = true;
      updateData.canEditProject = true;
    } else {
      if (typeof canRemoveUser === 'boolean') {
        updateData.canRemoveUser = canRemoveUser;
      }
      if (typeof canRemoveChannel === 'boolean') {
        updateData.canRemoveChannel = canRemoveChannel;
      }
      if (typeof canEditProject === 'boolean') {
        updateData.canEditProject = canEditProject;
      }
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
        console.error('Error updating privileges:', error.message);
        return res.status(500).json({ error: 'Error updating privileges' });
      }

      if (!data) {
        console.error('No collaborator found to update.');
        return res.status(404).json({ error: 'Collaborator not found' });
      }

      return res.status(200).json({ collaborator: data, message: 'Privileges updated successfully.' });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
