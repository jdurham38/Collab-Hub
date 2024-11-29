import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function checkUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

    const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email);

  if (error) {
    console.error('Error checking user:', error.message);
    return res.status(400).json({ error: error.message });
  }

    const userExists = data && data.length > 0;

  return res.status(200).json({ exists: userExists });
}
