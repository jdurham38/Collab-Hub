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

  const { userId } = req.body;  // Assuming you are passing userId in the body

  // Check if the user has been onboarded
  const { data, error } = await supabase
    .from('users')
    .select('isOnboarded')
    .eq('id', userId)  // Match by user ID to get the onboarding status
    .single();  // We only expect one row

  if (error) {
    console.error('Error checking isOnboarded:', error.message);
    return res.status(400).json({ error: error.message });
  }

  // Return the value of isOnboarded
  return res.status(200).json({ isOnboarded: data?.isOnboarded });
}
