import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function acceptProjectRequest(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { projectId, userId, requestId } = req.body;

  if (!projectId || !userId || !requestId) {
    return res
      .status(400)
      .json({
        error: 'Missing projectId, userId, or requestId in the request body',
      });
  }

  try {
    const { error: updateRequestError } = await supabase
      .from('ProjectRequest')
      .update({ status: 'Accepted' })
      .eq('id', requestId);

    if (updateRequestError) {
      console.error('Error updating project request:', updateRequestError);
      return res
        .status(500)
        .json({
          error: 'Failed to update project request status',
          details: updateRequestError.message,
        });
    }

    const { error: collaboratorError } = await supabase
      .from('ProjectCollaborator')
      .insert([
        {
          projectId,
          userId,
          adminPrivileges: false,
          canRemoveUser: false,
          canRemoveChannel: false,
          canEditProject: false,
          canEditAdminAccess: false,
        },
      ]);
    if (collaboratorError) {
      console.error(
        'Error adding user to ProjectCollaborator:',
        collaboratorError,
      );
      return res
        .status(500)
        .json({
          error: 'Failed to add user to ProjectCollaborator',
          details: collaboratorError.message,
        });
    }

    return res
      .status(200)
      .json({ message: 'Project request accepted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        error: 'An unexpected error occurred',
        details: error.message,
      });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        error: 'An unexpected error occurred',
      });
    }
  }
}
