import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { UserPlus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { assignMentor, getAllMentors, getUnassignedStudents } from "@/api/students";
import { createAuthClient } from "@/lib/supabaseClient";

export function AssignMentorModal() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedMentor, setSelectedMentor] = useState<string>("");

    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['unassignedStudents'],
        queryFn: async () => {
            console.log("Fetching unassigned students...");
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);
            const data = await getUnassignedStudents(client);
            console.log("Fetched unassigned students:", data);
            return data;
        },
        enabled: isOpen,
    });

    const { data: mentors, isLoading: isLoadingMentors } = useQuery({
        queryKey: ['allMentors'],
        queryFn: async () => {
            console.log("Fetching mentors...");
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);
            const data = await getAllMentors(client);
            console.log("Fetched mentors:", data);
            return data;
        },
        enabled: isOpen,
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);
            return assignMentor(client, selectedStudent, selectedMentor);
        },
        onSuccess: () => {
            toast.success("Mentor assigned successfully");
            setIsOpen(false);
            setSelectedStudent("");
            setSelectedMentor("");
            queryClient.invalidateQueries({ queryKey: ['unassignedStudents'] });
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); // Assuming admin dashboard lists students
        },
        onError: (error) => {
            toast.error(`Failed to assign mentor: ${error.message}`);
        },
    });

    const handleAssign = () => {
        if (!selectedStudent || !selectedMentor) return;
        assignMutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Assign Mentor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Mentor to Student</DialogTitle>
                    <DialogDescription>
                        Select an unassigned student and a mentor to pair them.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Student</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingStudents ? "Loading..." : "Select student"} />
                            </SelectTrigger>
                            <SelectContent>
                                {students?.map((student: any) => (
                                    <SelectItem key={student.student_id} value={student.student_id}>
                                        {student.profiles?.full_name || student.enrollment_number || "Unknown"}
                                    </SelectItem>
                                ))}
                                {students?.length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">No unassigned students</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Mentor</Label>
                        <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingMentors ? "Loading..." : "Select mentor"} />
                            </SelectTrigger>
                            <SelectContent>
                                {mentors?.map((mentor: any) => (
                                    <SelectItem key={mentor.mentor_id} value={mentor.mentor_id}>
                                        {mentor.profiles?.full_name || mentor.department || "Unknown"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedStudent || !selectedMentor || assignMutation.isPending}
                    >
                        {assignMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            "Assign"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
