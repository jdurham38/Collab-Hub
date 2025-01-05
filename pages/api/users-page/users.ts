import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export default async function getAllUsers(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { page = '1', limit = '10', userId } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);


    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({ error: "Invalid page or limit parameters." });
    }

    const startIndex = (pageNumber - 1) * limitNumber;

     let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

    if(userId){
        query = query.eq('id', userId);
    }


    try {
        const { data: users, error: usersError, count } = await query
         .range(startIndex, startIndex + limitNumber - 1);

        if (usersError) {
            console.error("Error fetching users:", usersError);
            return res.status(500).json({ error: usersError.message });
        }

        const totalCount = count || 0;

        return res.status(200).json({ users, totalCount });

    } catch (e) {
       let errorMessage = "An unexpected error occurred";
       if (e instanceof Error) {
        errorMessage = e.message || 'An error occurred during database operation.';
       } else if (typeof e === 'string') {
            errorMessage = e;
       }
        console.error("Error during database operation:", e);
        return res.status(500).json({ error: errorMessage });
    }
}