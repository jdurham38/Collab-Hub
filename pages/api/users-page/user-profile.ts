import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client outside the handler for efficiency
const supabase: SupabaseClient = createClient(
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

  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(
        'username, createdAt, role, shortBio, bio, tiktokLink, linkedinLink, instagramLink, twitterLink, behanceLink, profileImageUrl, id'
      );


    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ error: usersError.message });
    }

    return res.status(200).json({ users });
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