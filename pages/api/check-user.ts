import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function checkUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  // Check if the email already exists in the users table
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email);

  if (error) {
    console.error('Error checking user:', error.message);
    return res.status(400).json({ error: error.message });
  }

  // If the query returned any data, the user exists
  const userExists = data && data.length > 0;

  return res.status(200).json({ exists: userExists });
}
