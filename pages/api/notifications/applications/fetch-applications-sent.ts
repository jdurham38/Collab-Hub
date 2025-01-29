import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function getApplicantProjectRequests(
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
    const { data: projectRequests, error: projectRequestError } = await supabase
      .from('ProjectRequest')
      .select('id, projectId, status')
      .eq('userId', userId);

    if (projectRequestError) {
      console.error('Error fetching project requests:', projectRequestError);
      return res.status(500).json({
        error: 'Failed to fetch project requests',
        details: projectRequestError.message,
      });
    }

    const projectsWithTitles = await Promise.all(
      projectRequests.map(async (request) => {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('title')
          .eq('id', request.projectId)
          .single();

        if (projectError) {
          console.error(
            `Error fetching project data for projectId ${request.projectId}:`,
            projectError,
          );
          return { ...request, error: 'Error fetching project data' };
        }

        return {
          ...request,
          projectTitle: projectData?.title,
        };
      }),
    );

    return res.status(200).json(projectsWithTitles);
  } catch (error) {
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
