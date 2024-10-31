import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function checkOnboardStatus(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body; // Assuming you are passing userId in the body

  // Check if the user has been onboarded
  const { data, error } = await supabase
    .from('users')
    .select('isOnboarded')
    .eq('id', userId)
    .single(); // We only expect one row

  if (error) {
    // Check if the error is due to the user not being found
    if (error.code === 'PGRST116') { // "No rows found for single" error in Supabase
      console.log('User not found, likely already deleted');
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('Error checking isOnboarded:', error.message);
    return res.status(400).json({ error: error.message });
  }

  // Return the value of isOnboarded if user exists
  return res.status(200).json({ isOnboarded: data.isOnboarded });
}
