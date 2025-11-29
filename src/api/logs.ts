import { SupabaseClient } from '@supabase/supabase-js';
import { createActivity } from "./activities";

export interface CreateLogParams {
    student_id: string;
    mentor_id: string;
    date: Date;
    hours: number;
    description: string;
}

export interface UpdateLogParams {
    status?: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    approved_by?: string;
    approved_at?: string;
}

export const createLog = async (client: SupabaseClient, params: CreateLogParams) => {
    const { data, error } = await client
        .from('logs')
        .insert({
            student_id: params.student_id,
            mentor_id: params.mentor_id,
            date: params.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            hours: params.hours,
            description: params.description,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;

    // Create activity for student (confirmation)
    await createActivity(client, {
        user_id: params.student_id,
        type: 'log_submission',
        message: `You submitted a new log for ${params.date.toISOString().split('T')[0]}`,
        related_id: data.log_id
    });

    return data;
};

export const updateLog = async (client: SupabaseClient, logId: string, params: UpdateLogParams) => {
    const { data, error } = await client
        .from('logs')
        .update({
            ...params,
            updated_at: new Date().toISOString()
        })
        .eq('log_id', logId)
        .select()
        .single();

    if (error) throw error;

    // Notify student about status change
    if (params.status) {
        // We need to fetch the log to get the student_id
        const { data: logData } = await client
            .from('logs')
            .select('student_id, date')
            .eq('log_id', logId)
            .single();

        if (logData) {
            await createActivity(client, {
                user_id: logData.student_id,
                type: params.status === 'approved' ? 'log_approval' : 'log_rejection',
                message: `Your log for ${logData.date} was ${params.status}`,
                related_id: logId
            });
        }
    }

    return data;
};

export const deleteLog = async (client: SupabaseClient, logId: string) => {
    const { error } = await client
        .from('logs')
        .delete()
        .eq('log_id', logId);

    if (error) throw error;
    return true;
};

export const getStudentLogs = async (client: SupabaseClient, studentId: string) => {
    const { data, error } = await client
        .from('logs')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

export const getPendingLogs = async (client: SupabaseClient, mentorId: string) => {
    const { data, error } = await client
        .from('logs')
        .select('*, students(full_name, avatar_url)') // Assuming students join with profiles for name/avatar
        .eq('mentor_id', mentorId)
        .eq('status', 'pending')
        .order('date', { ascending: true });

    if (error) throw error;
    return data;
};
