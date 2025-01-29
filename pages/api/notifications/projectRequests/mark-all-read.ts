import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
);

export default async function markAllRead(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { recordIds, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
        return res.status(400).json({ error: 'Missing recordIds or is not an array' });
    }

    try {
        // Fetch records to check the isReadReceiver value before updating.
        const { data: existingRequests, error: fetchError } = await supabase
            .from('ProjectRequest')
            .select('id, isReadReceiver')
            .in('id', recordIds);

        if (fetchError) {
            console.error('Error fetching project requests for update check:', fetchError);
            return res.status(500).json({
                error: 'Failed to fetch project requests to check their read status',
                details: fetchError.message,
            });
        }

        const requestsToUpdate = existingRequests
            .filter(request => !request.isReadReceiver)
            .map(request => request.id);

        // Only update records where isReadReceiver is false
        if (requestsToUpdate.length > 0) {
            const { error } = await supabase
                .from('ProjectRequest')
                .update({ isReadReceiver: true })
                .in('id', requestsToUpdate);

            if (error) {
                console.error('Error marking project requests as read:', error);
                return res.status(500).json({
                    error: 'Failed to mark project requests as read',
                    details: error.message,
                });
            }
        }
        return res
            .status(200)
            .json({ message: 'Project requests marked as read successfully' });

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