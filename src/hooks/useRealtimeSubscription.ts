import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface UseRealtimeSubscriptionProps {
    table: string;
    queryKey: string[];
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
}

export const useRealtimeSubscription = ({ table, queryKey, event = '*', filter }: UseRealtimeSubscriptionProps) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel(`public:${table}:${queryKey.join('-')}`)
            .on(
                // @ts-ignore - Supabase types are strict about event string literals
                'postgres_changes',
                {
                    event,
                    schema: 'public',
                    table,
                    filter,
                },
                (payload) => {
                    console.log('Realtime change received:', payload);
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, queryKey, event, filter, queryClient]);
};
