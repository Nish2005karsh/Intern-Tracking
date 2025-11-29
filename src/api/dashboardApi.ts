import { createAuthClient } from '@/lib/supabaseClient';

// Helper to wrap requests with auth
const withAuth = async <T>(token: string, callback: (client: ReturnType<typeof createAuthClient>) => Promise<T>): Promise<T> => {
    const client = createAuthClient(token);
    return callback(client);
};

export const getStudentDashboardData = async (token: string, clerkId: string) => {
    return withAuth(token, async (client) => {
        try {
            // First, get the profile by clerk_id to get the UUID
            const { data: profile, error: profileError } = await client
                .from('profiles')
                .select('*')
                .eq('clerk_id', clerkId)
                .single();

            if (profileError) throw profileError;
            if (!profile) throw new Error('Profile not found');

            const studentUuid = profile.id;

            const { data: internships, error: internshipError } = await client
                .from('internships')
                .select('*')
                .eq('student_id', studentUuid);

            if (internshipError) throw internshipError;

            const { data: logs, error: logsError } = await client
                .from('logs')
                .select('*')
                .eq('student_id', studentUuid);

            if (logsError) throw logsError;

            const { data: skills, error: skillsError } = await client
                .from('skills_progress')
                .select('*')
                .eq('student_id', studentUuid);

            if (skillsError) throw skillsError;

            const { data: documents, error: docsError } = await client
                .from('documents')
                .select('*')
                .eq('student_id', studentUuid);

            if (docsError) throw docsError;

            return {
                data: {
                    profile,
                    internships,
                    logs,
                    skills,
                    documents
                },
                error: null
            };
        } catch (error) {
            console.error("Error fetching student dashboard data:", error);
            return { data: null, error };
        }
    });
};

export const getMentorDashboardData = async (token: string, clerkId: string) => {
    return withAuth(token, async (client) => {
        try {
            // First, get the profile by clerk_id to get the UUID
            const { data: profile, error: profileError } = await client
                .from('profiles')
                .select('*')
                .eq('clerk_id', clerkId)
                .single();

            if (profileError) throw profileError;
            if (!profile) throw new Error('Profile not found');

            const mentorUuid = profile.id;

            const { data: students, error: studentsError } = await client
                .from('students')
                .select('*, profiles(*)')
                .eq('mentor_id', mentorUuid);

            if (studentsError) throw studentsError;

            // Get logs for all assigned students
            const studentIds = students?.map(s => s.student_id) || [];

            let logs: any[] = [];
            if (studentIds.length > 0) {
                const { data: logsData, error: logsError } = await client
                    .from('logs')
                    .select('*')
                    .in('student_id', studentIds);

                if (logsError) throw logsError;
                logs = logsData || [];
            }

            const { data: reviews, error: reviewsError } = await client
                .from('mentor_reviews')
                .select('*')
                .eq('mentor_id', mentorUuid);

            if (reviewsError) throw reviewsError;

            return {
                data: {
                    profile,
                    students,
                    logs,
                    reviews
                },
                error: null
            };
        } catch (error) {
            console.error("Error fetching mentor dashboard data:", error);
            return { data: null, error };
        }
    });
};

export const getAdminDashboardData = async (token: string) => {
    return withAuth(token, async (client) => {
        try {
            const { data: profiles, error: profilesError } = await client
                .from('profiles')
                .select('*');

            if (profilesError) throw profilesError;

            const { count: studentCount, error: studentCountError } = await client
                .from('students')
                .select('*', { count: 'exact', head: true });

            if (studentCountError) throw studentCountError;

            const { count: mentorCount, error: mentorCountError } = await client
                .from('mentors')
                .select('*', { count: 'exact', head: true });

            if (mentorCountError) throw mentorCountError;

            const { count: internshipCount, error: internshipCountError } = await client
                .from('internships')
                .select('*', { count: 'exact', head: true });

            if (internshipCountError) throw internshipCountError;

            const { count: activeInternshipCount, error: activeInternshipError } = await client
                .from('internships')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            if (activeInternshipError) throw activeInternshipError;

            const { count: pendingLogsCount, error: pendingLogsError } = await client
                .from('logs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (pendingLogsError) throw pendingLogsError;

            return {
                data: {
                    profiles,
                    stats: {
                        totalStudents: studentCount,
                        totalMentors: mentorCount,
                        totalInternships: internshipCount,
                        activeInternships: activeInternshipCount,
                        pendingLogs: pendingLogsCount
                    }
                },
                error: null
            };
        } catch (error) {
            return { data: null, error };
        }
    });
};
