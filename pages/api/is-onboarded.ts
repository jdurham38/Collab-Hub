import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function checkOnboardStatus(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body; 
    const { data, error } = await supabase
    .from('users')
    .select('isOnboarded')
    .eq('id', userId)
    .single(); 
  if (error) {
        if (error.code === 'PGRST116') {       console.log('User not found, likely already deleted');
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('Error checking isOnboarded:', error.message);
    return res.status(400).json({ error: error.message });
  }

    return res.status(200).json({ isOnboarded: data.isOnboarded });
}
