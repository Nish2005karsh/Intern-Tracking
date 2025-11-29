
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dxdmyrwgmtrkwpbgilkr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZG15cndnbXRya3dwYmdpbGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA1NDgsImV4cCI6MjA3OTgyNjU0OH0.fMq570ELHWNEhgt2DKZDM5uWcnDDz1rAKrBBVKx_m28';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
    console.log('Checking constraints...');

    // We can't query information_schema directly with the JS client easily due to permissions usually,
    // but we can try RPC or just inspect the error message by making a bad request?
    // Or we can try to infer it.

    // Actually, let's try to query the tables and see if we can get the relationship info via the error message
    // by trying a known bad relationship name.

    const { data, error } = await supabase
        .from('students')
        .select('*, profiles!inner(*)')
        .limit(1);

    if (error) {
        console.log('Error querying students:', error);
        // The error message often contains "Could not find a relationship between..." or hints.
    } else {
        console.log('Success querying students with profiles!inner');
    }

    const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*, profiles!inner(*)')
        .limit(1);

    if (mentorsError) {
        console.log('Error querying mentors:', mentorsError);
    } else {
        console.log('Success querying mentors with profiles!inner');
    }
}

checkConstraints();
