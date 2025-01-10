import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { profanity } from '@2toad/profanity';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function checkUsername(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.body;

  if (profanity.exists(username)) {
    return res.status(400).json({ error: 'Profanity detected in username' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', username);

  if (error) {
    console.error('Error checking username:', error.message);
    return res.status(400).json({ error: error.message });
  }

  const usernameExists = data && data.length > 0;

  return res.status(200).json({ exists: usernameExists });
}
