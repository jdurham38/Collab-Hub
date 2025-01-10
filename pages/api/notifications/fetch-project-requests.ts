import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function getProjectRequestsWithTitles(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const userId = req.query.userId as string;

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

    const { data: projectRequests, error: projectRequestError } = await supabase
      .from('ProjectRequest')
      .select('id, projectId, userId')
      .in('projectId', projectIds)
      .eq('status', 'pending');

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
          .select('title, created_by')
          .eq('id', request.projectId)
          .single();

        if (projectError) {
          console.error(
            `Error fetching project data for projectId ${request.projectId}:`,
            projectError,
          );
          return { ...request, error: 'Error fetching project data' };
        }

        const { data: creatorData, error: creatorError } = await supabase
          .from('users')
          .select('id, username, role')
          .eq('id', projectData?.created_by)
          .single();

        if (creatorError) {
          console.error(
            `Error fetching user data for created_by ${projectData?.created_by}:`,
            creatorError,
          );
          return { ...request, error: 'Invalid Project Creator' };
        }
        if (!creatorData) {
          return { ...request, error: 'Invalid Project Creator' };
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, role')
          .eq('id', request.userId)
          .single();

        if (userError) {
          console.error(
            `Error fetching user data for userId ${request.userId}:`,
            userError,
          );
          return { ...request, error: 'Error fetching applicant user data' };
        }

        return {
          ...request,
          projectTitle: projectData?.title,
          applicantUsername: userData?.username,
          applicantRole: userData?.role,
          creatorUsername: creatorData?.username,
          creatorRole: creatorData?.role,
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
