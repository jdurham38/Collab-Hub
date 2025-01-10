import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const userId = req.query.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 2;
  const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
  const roles = req.query.roles ? (req.query.roles as string).split(',') : [];
  const dateRange = (req.query.dateRange as string) || 'all';
  const searchTerm = (req.query.searchTerm as string) || '';

  if (Array.isArray(userId)) {
    return res
      .status(400)
      .json({ error: 'Only one userId parameter is allowed' });
  }

  if (!userId) {
    return res
      .status(400)
      .json({ error: 'userId query parameter is required' });
  }

  const startIndex = (page - 1) * limit;

  try {
    let query = supabase
      .from('projects')
      .select(
        'id, title, createdAt, banner_url, tags, created_by, roles, description',
        { count: 'exact' },
      )
      .order('createdAt', { ascending: false });

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }

    if (roles.length > 0) {
      query = query.contains('roles', roles);
    }

    if (dateRange !== 'all') {
      const today = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(today);
          break;
        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 1);
          break;
        case 'last7days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'last30days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        default:
          startDate = new Date(today);
      }
      if (dateRange === 'today' || dateRange === 'yesterday') {
        query = query
          .gte('createdAt', startDate.toISOString())
          .lt(
            'createdAt',
            new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          );
      } else {
        query = query
          .gte('createdAt', startDate.toISOString())
          .lte('createdAt', today.toISOString());
      }
    }

    const {
      data: projects,
      error: projectError,
      count,
    } = await query.range(startIndex, startIndex + limit - 1);

    if (projectError) {
      console.error('Error fetching user projects:', projectError.message);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    if (projects.length > 0) {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .in(
          'id',
          projects.map((project) => project.created_by),
        );

      if (userError) {
        console.error('Error fetching user details:', userError.message);
        return res.status(500).json({ error: 'Failed to fetch user details' });
      }

      const usersMap = new Map();
      users.forEach((user) => {
        usersMap.set(user.id, user.username);
      });

      const projectsWithUsernames = projects.map((project) => ({
        ...project,
        created_by_username: usersMap.get(project.created_by) || 'Unknown User',
      }));

      return res
        .status(200)
        .json({ projects: projectsWithUsernames, totalCount: count });
    } else {
      return res.status(200).json({ projects: [], totalCount: 0 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
