import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Bell } from "lucide-react";
import { format } from "date-fns";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getActivities, markAsRead, markAllAsRead } from "@/api/activities";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { supabase, createAuthClient } from "@/lib/supabaseClient";

export function NotificationBell() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities', user?.id],
        queryFn: async () => {
            const token = await getToken({ template: "supabase" });
            if (!token) return [];

            const client = createAuthClient(token);

            // We need the profile ID (UUID) for the activities query if we stored UUIDs
            // But activities table usually stores UUIDs.
            // Let's assume we need to resolve the profile ID first.
            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            if (!profile) return [];

            return getActivities(client, profile.id);
        },
        enabled: !!user,
    });

    const markReadMutation = useMutation({
        mutationFn: async (activityId: string) => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);
            return markAsRead(client, activityId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");

            const client = createAuthClient(token);

            // Get profile ID again... ideally we should have a useProfile hook
            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            if (profile) {
                return markAllAsRead(client, profile.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });

    // Real-time subscription for new activities
    // We need the user's UUID to filter, but for now we can listen to all and invalidate
    // Or better, fetch profile ID once and store in context/hook.
    // For this component, let's just listen to 'activities' table.
    useRealtimeSubscription({
        table: 'activities',
        queryKey: ['activities'],
        // filter: `user_id=eq.${profileId}` // Hard to get profileId here without prop or hook
    });

    const unreadCount = activities?.filter(a => !a.is_read).length || 0;

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) {
            // Optional: Mark all as read when opening, or let user click individual
            // For now, let's keep them unread until clicked or "Mark all read"
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : activities?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                    ) : (
                        <div className="divide-y">
                            {activities?.map((activity) => (
                                <div
                                    key={activity.activity_id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!activity.is_read ? 'bg-muted/20' : ''}`}
                                    onClick={() => !activity.is_read && markReadMutation.mutate(activity.activity_id)}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {activity.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
