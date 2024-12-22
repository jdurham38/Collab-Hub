// cleanup_old_messages.ts

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs



console.log('Cleanup Old Messages Edge Function');

// Initialize Supabase client with the service role key
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase URL or Service Role Key.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }),
        { status: 500 }
      );
    }

    const supabase: SupabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    // Calculate the cutoff date (14 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);

    // Step 1: Fetch user IDs of owners on the "free" plan
    const { data: freeUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('plan', 'free');

    if (usersError) {
      console.error('Error fetching free-plan users:', usersError.message);
      return new Response(
        JSON.stringify({ error: 'Error fetching users' }),
        { status: 500 }
      );
    }

    if (!freeUsers || freeUsers.length === 0) {
      console.log('No users on free plan found.');
      return new Response(
        JSON.stringify({ message: 'No old messages to delete.' }),
        { status: 200 }
      );
    }

    const freeUserIds = freeUsers.map((user: { id: string }) => user.id);

    // Step 2: Fetch projects where the owner is on the "free" plan
    const { data: freeProjects, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .in('created_by', freeUserIds);

    if (projectError) {
      console.error(
        'Error fetching projects with free-plan owners:',
        projectError.message
      );
      return new Response(
        JSON.stringify({ error: 'Error fetching projects' }),
        { status: 500 }
      );
    }

    if (!freeProjects || freeProjects.length === 0) {
      console.log('No projects found with free-plan owners.');
      return new Response(
        JSON.stringify({ message: 'No old messages to delete.' }),
        { status: 200 }
      );
    }

    // Extract project IDs
    const freeProjectIds = freeProjects.map(
      (project: { id: string }) => project.id
    );

    // Step 3: Delete messages older than 14 days for these projects
    const fourteenDaysAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .in('project_id', freeProjectIds)
      .lt('created_at', fourteenDaysAgo);

    if (deleteError) {
      console.error('Error deleting old messages:', deleteError.message);
      return new Response(
        JSON.stringify({ error: 'Error deleting old messages' }),
        { status: 500 }
      );
    }

    console.log('Successfully deleted old messages for free-plan projects');
    return new Response(
      JSON.stringify({ message: 'Old messages deleted successfully.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred.' }),
      { status: 500 }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://localhost:54321/functions/v1/cleanup_old_messages' \
    --header 'Authorization: Bearer <YOUR_ANON_OR_SERVICE_ROLE_KEY>' \
    --header 'Content-Type: application/json'

*/
