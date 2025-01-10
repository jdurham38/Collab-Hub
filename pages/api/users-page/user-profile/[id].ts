import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export default async function getUserById(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Fetch user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('username, createdAt, role, shortBio, bio, tiktokLink, linkedinLink, instagramLink, twitterLink, behanceLink, profileImageUrl, id')
            .eq('id', id)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            return res.status(500).json({ error: userError.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch collaborator count
        const { count, error: collaboratorError } = await supabase
            .from('ProjectCollaborator')
            .select('*', { count: 'exact' }) // Use '*' and `count: 'exact'` to get the total row count
            .eq('userId', id);

        if (collaboratorError) {
             console.error('Error fetching collaborator count:', collaboratorError);
             return res.status(500).json({ error: collaboratorError.message });
        }

        const projectCount = count || 0;

        return res.status(200).json({ user, projectCount }); // Return both user data and project count

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