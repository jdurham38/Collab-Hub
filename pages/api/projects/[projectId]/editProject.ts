import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';
import { Project } from '@/utils/interfaces';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { projectId } = req.query;

  if (typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  switch (req.method) {
    case 'PUT':
      await handlePutRequest(req, res, projectId);
      break;
    case 'GET':
      await handleGetRequest(req, res, projectId);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
) {
  try {
    const { data, error }: PostgrestSingleResponse<Project> = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch project', details: error });
  }
}

async function handlePutRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
) {
  const { title, description, banner_url, tags, roles } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await supabase
      .from('projects')
      .update({ title, description, banner_url, tags, roles })
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    return res
      .status(500)
      .json({ error: 'Failed to update project', details: error });
  }
}
