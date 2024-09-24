// pages/api/signup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { UserData } from '@/utils/interfaces';
import supabase from '@/lib/supabaseClient/supabase';

// API Route to handle user sign-up
export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  // Check if the method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract user data from the request body
  const userData: UserData = req.body;

  // Attempt to sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  // Handle errors
  if (error) {
    console.error('Error signing up:', error.message);
    return res.status(400).json({ error: error.message });
  }

  // Return a success response
  res.status(200).json({ message: 'Signup successful', user: data?.user });
}
