// pages/api/delete-account.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is the service role key
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  // Get the user using the access token
  const {
    data: { user },
    error: getUserError,
  } = await supabaseAdmin.auth.getUser(token);

  if (getUserError || !user) {
    console.error('Error getting user:', getUserError?.message);
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = user.id;

  // Delete user data from 'users' table
  const { error: deleteUserError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (deleteUserError) {
    console.error('Error deleting user data:', deleteUserError.message);
    return res.status(500).json({ error: 'Error deleting user data' });
  }

  // Delete user from Supabase Auth
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    console.error('Error deleting user from auth:', deleteAuthError.message);
    return res.status(500).json({ error: 'Error deleting user from auth' });
  }

  return res.status(200).json({ message: 'Account deleted successfully' });
}