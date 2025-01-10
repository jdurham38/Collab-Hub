

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            await handleGetById(req, res);
            break;
        case 'PATCH':
            await handlePatch(req, res);
            break;
        case 'DELETE':
            await handleDelete(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method Not Allowed' });
    }
}


async function handleGetById(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invite ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('project_invites')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching project invite:', error);
            return res.status(404).json({ error: 'Project invite not found' });
        }
        return res.status(200).json(data);
    } catch (e) {
        let errorMessage = 'An unexpected error occurred';
        if (e instanceof Error) {
            errorMessage = e.message || 'An error occurred during database operation.';
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        console.error('Error during database operation:', e);
        return res.status(500).json({ error: errorMessage });
    }
}


async function handlePatch(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query;
    const { status, userId } = req.body;


    if (!id || typeof id !== 'string' || !status || !userId) {
        return res.status(400).json({ error: 'Invite ID, status and userId are required' });
    }

    try {
       const { data: inviteData, error: fetchError } = await supabase
            .from('project_invites')
            .select('receiver_id, project_id')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error('Error finding invite id', fetchError)
            return res.status(404).json({ error: 'Invite not found' })
        }

        if (inviteData.receiver_id !== userId) {
            return res.status(401).json({ error: 'Unauthorized user to change status' });
        }
        if (status === 'accepted') {
               
              const { error: collaboratorError } = await supabase
                .from('ProjectCollaborator')
                .insert([
                    {
                        userId: userId,
                        projectId: inviteData.project_id,
                        joinedAt: new Date().toISOString(),
                        adminPrivileges: false,
                        canRemoveUser: false,
                        canRemoveChannel: false,
                        canEditProject: false,
                        canEditAdminAccess: false,
                    }
                ]);
            if (collaboratorError) {
                console.error('Error creating project collaborator:', collaboratorError);
                return res.status(500).json({ error: 'Failed to create project collaborator' });
             }
             
             const { error: deleteError } = await supabase
                .from('project_invites')
                .delete()
                .eq('id', id);
            if (deleteError) {
                  console.error('Error deleting project invite:', deleteError);
                  return res.status(500).json({ error: 'Failed to delete project invite' });
             }
            return res.status(200).json({ message: 'Invite accepted, and collaborator created' });

        } else if (status === 'rejected') {
            
             const { error: deleteError } = await supabase
                .from('project_invites')
                .delete()
                .eq('id', id);
            if (deleteError) {
                  console.error('Error deleting project invite:', deleteError);
                  return res.status(500).json({ error: 'Failed to delete project invite' });
             }
            return res.status(200).json({message: 'Invite rejected and deleted'})
          } else {
            return res.status(400).json({ error: 'Invalid status provided' })
          }
    } catch (e) {
         let errorMessage = 'An unexpected error occurred';
        if (e instanceof Error) {
            errorMessage = e.message || 'An error occurred during database operation.';
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
         console.error('Error during database operation:', e);
        return res.status(500).json({ error: errorMessage });
    }
}


async function handleDelete(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query;
    const { userId } = req.body;
    if (!id || typeof id !== 'string' || !userId) {
        return res.status(400).json({ error: 'Invite ID and userId are required' });
    }

    try {
        const { data: inviteData, error: fetchError } = await supabase
            .from('project_invites')
            .select('sender_id, receiver_id')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error('Error finding invite id', fetchError)
            return res.status(404).json({ error: 'Invite not found' })
        }
        if (inviteData.sender_id !== userId && inviteData.receiver_id !== userId) {
            return res.status(401).json({ error: 'Unauthorized to delete invite' });
        }
        const { error } = await supabase
            .from('project_invites')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project invite:', error);
            return res.status(500).json({ error: error.message });
        }
    } catch (e) {
        let errorMessage = 'An unexpected error occurred';
        if (e instanceof Error) {
            errorMessage = e.message || 'An error occurred during database operation.';
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        console.error('Error during database operation:', e);
        return res.status(500).json({ error: errorMessage });
    }
}