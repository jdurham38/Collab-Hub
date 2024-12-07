// pages/api/projects/[projectId]/collaborators/[userId].ts
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

  if (req.method === 'PATCH') {
    const { adminPrivileges, canRemoveUser, canRemoveChannel, canEditProject } = req.body;

    // Validate input types
    // adminPrivileges is boolean
    if (typeof adminPrivileges !== 'boolean') {
      return res.status(400).json({ error: 'Invalid adminPrivileges value' });
    }

    // If adminPrivileges is true, all other fields are forced true
    let updateData: any = { adminPrivileges };

    if (adminPrivileges) {
      updateData.canRemoveUser = true;
      updateData.canRemoveChannel = true;
      updateData.canEditProject = true;
    } else {
      // If adminPrivileges is false, use the provided values for the other fields
      // If they are not provided, do not overwrite them (allow partial updates)
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
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
