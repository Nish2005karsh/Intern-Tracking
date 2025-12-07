import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export interface Activity {
    activity_id: string;
    user_id: string;
    type: 'log_submission' | 'log_approval' | 'log_rejection' | 'document_upload' | 'mentor_assignment';
    description: string; // Mapped from DB 'description'
    message?: string; // Alias for description for frontend compatibility
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
    if (error) throw error;
    return data.map((a: any) => ({ ...a, message: a.description })) as Activity[];
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

export const createActivity = async (client: SupabaseClient, activity: { user_id: string, type: string, message: string, related_id?: string }) => {
    const { error } = await client
        .from('activities')
        .insert([{
            user_id: activity.user_id,
            activity_type: activity.type,
            description: activity.message,
            related_id: activity.related_id
        }]);

    if (error) throw error;
};
