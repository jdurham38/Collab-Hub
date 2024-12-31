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

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { projectId, userId } = req.query;

    if (!projectId || !userId) {
        return res.status(400).json({ message: 'projectId and userId are required' });
    }
    try {
         const { data, error } = await supabase
              .from('ProjectRequest')
              .select('id')
              .match({projectId, userId})


        if (error) {
            console.error('Error fetching application status:', error.message);
            return res.status(500).json({ error: 'Failed to check application status' });
        }


        const hasApplied = data !== null && data.length > 0;

        return res.status(200).json({ hasApplied });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}