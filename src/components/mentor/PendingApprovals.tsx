import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingLogs, updateLog } from "@/api/logs";
import { createAuthClient, supabase } from "@/lib/supabaseClient";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export function PendingApprovals({ searchQuery = "" }: { searchQuery?: string }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const { data: pendingLogs, isLoading, error } = useQuery({
        queryKey: ['pendingLogs', user?.id],
        queryFn: async () => {
            const token = await getToken({ template: "supabase" });
            if (!token) return [];

            const client = createAuthClient(token);

            // Get mentor ID from profile
            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            if (!profile) return [];

            return getPendingLogs(client, profile.id);
        },
        enabled: !!user,
    });

    const updateMutation = useMutation({
        mutationFn: async ({ logId, status, reason }: { logId: string, status: 'approved' | 'rejected', reason?: string }) => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);

            // Get mentor ID for approved_by
            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            return updateLog(client, logId, {
                status,
                rejection_reason: reason,
                approved_by: status === 'approved' ? profile?.id : undefined,
                approved_at: status === 'approved' ? new Date().toISOString() : undefined
            });
        },
        onSuccess: () => {
            toast.success("Log updated successfully");
            setRejectModalOpen(false);
            setRejectionReason("");
            setSelectedLogId(null);
            queryClient.invalidateQueries({ queryKey: ['pendingLogs'] });
            queryClient.invalidateQueries({ queryKey: ['mentorDashboard'] });
        },
        onError: (error) => {
            toast.error(`Failed to update log: ${error.message}`);
        },
    });

    // Real-time subscription
    useRealtimeSubscription({
        table: 'logs',
        queryKey: ['pendingLogs'],
    });

    const handleApprove = (logId: string) => {
        updateMutation.mutate({ logId, status: 'approved' });
    };

    const handleRejectClick = (logId: string) => {
        setSelectedLogId(logId);
        setRejectModalOpen(true);
    };

    const handleRejectConfirm = () => {
        if (!selectedLogId) return;
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        updateMutation.mutate({ logId: selectedLogId, status: 'rejected', reason: rejectionReason });
    };

    if (isLoading) {
        return <Skeleton className="h-[200px] w-full" />;
    }

    if (error) {
        return <div className="text-red-500">Error loading pending approvals</div>;
    }

    if (!pendingLogs || pendingLogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Check className="h-12 w-12 mb-4 opacity-20" />
                <p>No pending approvals</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingLogs
                            .filter((log: any) =>
                                log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (log.students?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((log: any) => (
                                <TableRow key={log.log_id}>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={log.students?.avatar_url} />
                                            <AvatarFallback>{log.students?.full_name?.charAt(0) || "S"}</AvatarFallback>
                                        </Avatar>
                                        {log.students?.full_name || "Unknown Student"}
                                    </TableCell>
                                    <TableCell>{format(new Date(log.date), "MMM d, yyyy")}</TableCell>
                                    <TableCell>{log.hours}h</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={log.description}>
                                        {log.description}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleApprove(log.log_id)}
                                            disabled={updateMutation.isPending}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleRejectClick(log.log_id)}
                                            disabled={updateMutation.isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Log Entry</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this log entry. The student will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectConfirm}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Rejecting..." : "Reject Log"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
