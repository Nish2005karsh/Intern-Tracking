import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export interface Activity {
    activity_id: string;
    user_id: string;
    type: 'log_submission' | 'log_approval' | 'log_rejection' | 'document_upload' | 'mentor_assignment';
    message: string;
    is_read: boolean;
    created_at: string;
    related_id?: string;
    link?: string;
}

export const getActivities = async (client: SupabaseClient, userId: string) => {
    const { data, error } = await client
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data as Activity[];
};

export const markAsRead = async (client: SupabaseClient, activityId: string) => {
    const { error } = await client
        .from('activities')
        .update({ is_read: true })
        .eq('activity_id', activityId);

    if (error) throw error;
};

export const markAllAsRead = async (client: SupabaseClient, userId: string) => {
    const { error } = await client
        .from('activities')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
};

export const createActivity = async (client: SupabaseClient, activity: Omit<Activity, 'activity_id' | 'created_at' | 'is_read'>) => {
    const { error } = await client
        .from('activities')
        .insert([activity]);

    if (error) throw error;
};
