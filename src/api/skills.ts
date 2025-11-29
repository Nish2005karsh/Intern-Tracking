import { SupabaseClient } from '@supabase/supabase-js';

export interface Skill {
    id: string;
    student_id: string;
    skill_name: string;
    percentage: number;
    updated_at: string;
}

export const getStudentSkills = async (client: SupabaseClient, studentId: string) => {
    const { data, error } = await client
        .from('skills_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('skill_name', { ascending: true });

    if (error) throw error;
    return data as Skill[];
};

export const addSkill = async (client: SupabaseClient, studentId: string, skillName: string, percentage: number) => {
    const { data, error } = await client
        .from('skills_progress')
        .insert({
            student_id: studentId,
            skill_name: skillName,
            percentage: percentage
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateSkill = async (client: SupabaseClient, skillId: string, percentage: number) => {
    const { data, error } = await client
        .from('skills_progress')
        .update({
            percentage: percentage,
            updated_at: new Date().toISOString()
        })
        .eq('id', skillId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteSkill = async (client: SupabaseClient, skillId: string) => {
    const { error } = await client
        .from('skills_progress')
        .delete()
        .eq('id', skillId);

    if (error) throw error;
    return true;
};
