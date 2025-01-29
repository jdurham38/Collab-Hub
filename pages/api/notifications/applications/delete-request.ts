import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default async function deleteProjectRequest(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { requestId } = req.query;

  if (!requestId) {
    return res.status(400).json({ error: 'Missing requestId' });
  }

  if (Array.isArray(requestId)) {
    return res.status(400).json({ error: 'Only one requestId is allowed' });
  }

  try {
    const { error: deleteError } = await supabase
      .from('ProjectRequest')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      console.error('Error deleting project request:', deleteError);
      return res.status(500).json({
        error: 'Failed to delete project request',
        details: deleteError.message,
      });
    }

    return res
      .status(200)
      .json({ message: 'Project request deleted successfully' });
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
