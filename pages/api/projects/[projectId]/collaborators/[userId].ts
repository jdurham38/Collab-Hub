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
      const { adminPrivileges } = req.body;
  
      if (typeof adminPrivileges !== 'boolean') {
        return res.status(400).json({ error: 'Invalid adminPrivileges value' });
      }
  
      try {
        const { data, error } = await supabase
          .from('ProjectCollaborator')
          .update({ adminPrivileges })
          .eq('projectId', projectId)
          .eq('userId', userId)
          .select() // Use select() to return the updated row
          .single();
  
        if (error) {
          console.error('Error updating admin privileges:', error.message);
          return res.status(500).json({ error: 'Error updating admin privileges' });
        }
  
        if (!data) {
          console.error('No collaborator found to update.');
          return res.status(404).json({ error: 'Collaborator not found' });
        }
  
  
        return res.status(200).json({ collaborator: data, message: 'Admin privileges updated successfully.' });
      } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.setHeader('Allow', ['PATCH']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  