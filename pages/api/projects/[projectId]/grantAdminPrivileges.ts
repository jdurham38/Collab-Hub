import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase= createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

export default async function (req: NextApiRequest, res: NextApiResponse){

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
    const {projectId} = req.query;
    const {userId} = req.body;
    const {adminPrivileges} = req.body;

    if (!userId || typeof projectId !== 'string'){
        console.error('invalid project id!', projectId);
        return res.status(400).json({error: 'invalid project id'});
    }


        try {
            const {data: projectOwner, error: ownerError} = await supabase  
                .from('projects')
                .select('created_by')
                .eq('id', projectId)
                .single();

                if(ownerError){
                    console.error('Error fetching project owner', ownerError.message);
                    return res.status(500).json({error: 'Error fetching project owner'})
                }

                const {data: collaborator, error: collaboratorError} = await supabase
                .from('ProjectCollaborator')
                .upsert({projectId, userId, adminPrivileges: true})
                .single();

                if (collaboratorError){
                    console.error('Error fetching collaborator:', collaboratorError.message);
                    return res.status(500).json({error: 'Error fetching collaborators'})
 
                }
                return res.status(200).json({ message: 'Admin privileges granted successfully.', collaborator });
        } catch (error) {
            console.error('Internal server error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }