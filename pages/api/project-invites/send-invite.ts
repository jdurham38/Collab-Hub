import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ProjectInvite } from '@/utils/interfaces';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'POST':
      await handlePost(req, res);
      break;
    case 'GET':
      await handleGet(req, res);
      break;
    default:
      res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { project_id, receiver_id, expires_at, sender_id } = req.body;
  if (!project_id || !receiver_id || !sender_id) {
    return res
      .status(400)
      .json({ error: 'Project ID, receiver ID, and sender_id are required' });
  }

  try {
     // Check if the user is already a collaborator on the project
    const { data: existingCollaborator, error: collaboratorError } = await supabase
        .from('ProjectCollaborator')
        .select('*')
        .eq('projectId', project_id)
        .eq('userId', receiver_id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (collaboratorError) {
        console.error('Error checking for existing collaborator:', collaboratorError);
        return res.status(500).json({ error: 'Error checking for existing collaborator' });
    }

     if (existingCollaborator) {
         return res.status(409).json({
              error: 'User is already a collaborator on this project',
              existingCollaborator
         })
    }


    // Check if an invite already exists for this project and receiver
    const { data: existingInvite, error: existingInviteError } = await supabase
      .from('project_invites')
      .select('*')
      .eq('project_id', project_id)
      .eq('receiver_id', receiver_id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (existingInviteError) {
      console.error('Error checking for existing invite:', existingInviteError);
      return res.status(500).json({ error: 'Error checking for existing invite' });
    }

    if (existingInvite) {
      return res.status(409).json({
        error: 'An invite already exists for this user in this project.',
        existingInvite,
      });
    }

    const newInvite: Omit<ProjectInvite, 'id' | 'invite_token'> = {
      project_id,
      sender_id,
      receiver_id,
      status: 'pending',
      created_at: new Date(),
      expires_at: expires_at ? new Date(expires_at) : null,
    };

    const { data, error } = await supabase
      .from('project_invites')
      .insert([newInvite])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating project invite:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (e) {
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage =
        e.message || 'An error occurred during database operation.';
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    console.error('Error during database operation:', e);
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { project_id, user_id, status } = req.query;
  try {
    let query = supabase.from('project_invites').select('*');

    if (project_id && typeof project_id === 'string') {
      query = query.eq('project_id', project_id);
    }

    if (user_id && typeof user_id === 'string') {
      query = query.or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching project invites:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (e) {
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage =
        e.message || 'An error occurred during database operation.';
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    console.error('Error during database operation:', e);
    return res.status(500).json({ error: errorMessage });
  }
}