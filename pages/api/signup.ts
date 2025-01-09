import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! );

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, username, location, role, profileImageUrl } = req.body;

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

    const { error: insertError } = await supabase.from('users').insert([
    {
      id: userId,
      email,
      username,
      role,
      location,
      profileImageUrl,
    }
  ]);

  if (insertError) {
    console.error('Error inserting user data:', insertError.message);
    return res.status(400).json({ error: insertError.message });
  }

  res.status(200).json({ message: 'Signup successful', user: data.user });
}
