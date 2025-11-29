import { SupabaseClient } from '@supabase/supabase-js';
import { createActivity } from "./activities";

export const assignMentor = async (client: SupabaseClient, studentId: string, mentorId: string) => {
    // 1. Update student record
    const { error } = await client
        .from('students')
        .update({ mentor_id: mentorId })
        .eq('student_id', studentId);

    if (error) throw error;

    // 2. Create activity for student
    await createActivity(client, {
        user_id: studentId,
        type: 'mentor_assignment',
        message: 'You have been assigned a new mentor.',
    });

    // 3. Create activity for mentor
    await createActivity(client, {
        user_id: mentorId,
        type: 'mentor_assignment',
        message: 'You have been assigned a new student.',
        related_id: studentId
    });

    return true;
};

export const getUnassignedStudents = async (client: SupabaseClient) => {
    const { data, error } = await client
        .from('students')
        .select('*, profiles(full_name, email, avatar_url)')
        .is('mentor_id', null);

    if (error) throw error;
    return data;
};

export const getAllMentors = async (client: SupabaseClient) => {
    const { data, error } = await client
        .from('mentors')
        .select('*, profiles(full_name, email, avatar_url)');

    if (error) throw error;
    return data;
};
