import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is the service role key
);

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, username, location } = req.body;

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error signing up:', error.message);
    return res.status(400).json({ error: error.message });
  }

  const userId = data.user?.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID not found after sign-up' });
  }

  // Insert user data into 'users' table
  const { error: insertError } = await supabase.from('users').insert([
    {
      id: userId,
      email,
      username, // Optional
      location, // Optional
      // dateModified and createdAt handled by database defaults
    }
  ]);

  if (insertError) {
    console.error('Error inserting user data:', insertError.message);
    return res.status(400).json({ error: insertError.message });
  }

  res.status(200).json({ message: 'Signup successful', user: data.user });
}
