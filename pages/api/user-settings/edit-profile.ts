import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export default async function handleUserProfile(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User id is missing' });
    }

    if (req.method === 'GET') {
         try {
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)

             if (usersError) {
                    console.error("Error fetching user:", usersError);
                    return res.status(500).json({ error: usersError.message });
                }

            if(users.length === 0)
            {
               return res.status(404).json({error: "User not found"})
             }


            return res.status(200).json({ user: users[0] });

        } catch (e) {
            let errorMessage = "An unexpected error occurred";
            if (e instanceof Error) {
             errorMessage = e.message || 'An error occurred during database operation.';
            } else if (typeof e === 'string') {
                errorMessage = e;
            }
             console.error("Error during database operation:", e);
             return res.status(500).json({ error: errorMessage });
        }
    }

    if (req.method === 'PATCH') {
        const {
            role,
            shortBio,
            bio,
            personalWebsite,
            instagramLink,
            linkedinLink,
            behanceLink,
            twitterLink,
            tiktokLink,
            profileImageUrl
        } = req.body;


        if (!role && !shortBio && !bio && !personalWebsite && !instagramLink && !linkedinLink && !behanceLink && !twitterLink && !tiktokLink && !profileImageUrl) {
            return res.status(400).json({ error: 'No fields provided for updating' });
        }

        try {
             const { data: users, error: usersError } = await supabase
                 .from('users')
                .update({
                    role,
                    shortBio,
                    bio,
                    personalWebsite,
                    instagramLink,
                    linkedinLink,
                    behanceLink,
                    twitterLink,
                    tiktokLink,
                    profileImageUrl,
                })
                .eq('id', userId)
               .select('*')

           if (usersError) {
                   console.error("Error updating user:", usersError);
                    return res.status(500).json({ error: usersError.message });
            }

            if(users.length === 0)
             {
                return res.status(404).json({error: "User not found"})
             }


           return res.status(200).json({ user: users[0] });


        } catch (e) {
           let errorMessage = "An unexpected error occurred";
            if (e instanceof Error) {
              errorMessage = e.message || 'An error occurred during database operation.';
           } else if (typeof e === 'string') {
               errorMessage = e;
            }
             console.error("Error during database operation:", e);
            return res.status(500).json({ error: errorMessage });
        }
    }
      return res.status(405).json({ message: 'Method Not Allowed' });
}