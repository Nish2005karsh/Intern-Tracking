import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase, createAuthClient } from '@/lib/supabaseClient';
import { Roles } from '@/types/globals';

const SyncUser = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        const syncUser = async () => {
            if (!isLoaded || !user) return;

            const { id: clerkId, primaryEmailAddress, fullName, imageUrl, publicMetadata } = user;
            const email = primaryEmailAddress?.emailAddress;
            const role = publicMetadata.role as Roles;

            if (!email || !role) return;

            try {
                const token = await getToken({ template: "supabase" });
                if (!token) {
                    console.error("SyncUser: No token available");
                    return;
                }

                const authClient = createAuthClient(token);

                // Check if profile exists
                const { data: existingProfile, error: fetchError } = await authClient
                    .from('profiles')
                    .select('id, avatar_url')
                    .eq('clerk_id', clerkId)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    console.error('Error checking profile:', fetchError);
                    return;
                }

                let profileId = existingProfile?.id;

                if (!existingProfile) {
                    // Create profile
                    const { data: newProfile, error: insertError } = await authClient
                        .from('profiles')
                        .insert([
                            {
                                clerk_id: clerkId,
                                email,
                                full_name: fullName,
                                avatar_url: imageUrl,
                                role,
                            },
                        ])
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Error creating profile:', insertError);
                        console.error('Payload:', { clerk_id: clerkId, email, full_name: fullName, avatar_url: imageUrl, role });
                        return;
                    }
                    profileId = newProfile.id;
                } else if (existingProfile.avatar_url !== imageUrl) {
                    // Update avatar if changed
                    await authClient
                        .from('profiles')
                        .update({ avatar_url: imageUrl })
                        .eq('id', profileId);
                }

                if (!profileId) return;

                // Sync role-specific tables
                if (role === 'student') {
                    const { data: existingStudent } = await authClient
                        .from('students')
                        .select('student_id')
                        .eq('student_id', profileId)
                        .single();

                    if (!existingStudent) {
                        await authClient.from('students').insert([
                            {
                                student_id: profileId,
                                status: 'active',
                            },
                        ]);
                    }
                } else if (role === 'mentor') {
                    const { data: existingMentor } = await authClient
                        .from('mentors')
                        .select('mentor_id')
                        .eq('mentor_id', profileId)
                        .single();

                    if (!existingMentor) {
                        await authClient.from('mentors').insert([
                            {
                                mentor_id: profileId,
                                specialization: 'Not set',
                            },
                        ]);
                    }
                }

            } catch (error) {
                console.error('Error syncing user:', error);
            }
        };

        syncUser();
    }, [isLoaded, user]);

    return null;
};

export default SyncUser;
