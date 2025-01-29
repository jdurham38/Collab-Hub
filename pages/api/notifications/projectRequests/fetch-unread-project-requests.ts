import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
);

export default async function fetchUnreadProjectRequests(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

   try {
    const { data: userProjects, error: userProjectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('created_by', userId);

    if (userProjectsError) {
      console.error(
        'Error fetching projects created by user:',
        userProjectsError,
      );
      return res.status(500).json({
        error: 'Failed to fetch projects created by user',
        details: userProjectsError.message,
      });
    }

    const projectIds = userProjects?.map((project) => project.id) || [];


      const { data, error } = await supabase
          .from('ProjectRequest')
          .select('*')
          .in('projectId', projectIds)
          .eq('isReadReceiver', false);

        if (error) {
          console.error('Error fetching unread project requests', error);
            return res.status(500).json({
              error: 'Failed to fetch unread project requests',
                details: error.message,
            });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'An unexpected error occurred',
                details: error.message,
            });
        } else {
            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'An unexpected error occurred',
            });
        }
    }
}