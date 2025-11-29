import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getStudentSkills, addSkill, updateSkill, deleteSkill } from "@/api/skills";
import { createAuthClient, supabase } from "@/lib/supabaseClient";

export function SkillsManager() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillPercentage, setNewSkillPercentage] = useState(50);
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
    const [editPercentage, setEditPercentage] = useState(0);

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills', user?.id],
        queryFn: async () => {
            const token = await getToken({ template: "supabase" });
            if (!token) return [];

            const client = createAuthClient(token);

            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            if (!profile) return [];

            const { data: student } = await client
                .from('students')
                .select('student_id')
                .eq('student_id', profile.id)
                .single();

            if (!student) return [];

            return getStudentSkills(client, student.student_id);
        },
        enabled: !!user,
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);

            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            return addSkill(client, profile.id, newSkillName, newSkillPercentage);
        },
        onSuccess: () => {
            toast.success("Skill added successfully");
            setIsAddOpen(false);
            setNewSkillName("");
            setNewSkillPercentage(50);
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, percentage }: { id: string, percentage: number }) => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);
            return updateSkill(client, id, percentage);
        },
        onSuccess: () => {
            toast.success("Skill updated");
            setEditingSkillId(null);
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);
            return deleteSkill(client, id);
        },
        onSuccess: () => {
            toast.success("Skill deleted");
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
        },
    });

    const startEdit = (skill: any) => {
        setEditingSkillId(skill.id);
        setEditPercentage(skill.percentage);
    };

    const saveEdit = (id: string) => {
        updateMutation.mutate({ id, percentage: editPercentage });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">My Skills</h3>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Skill
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Skill</DialogTitle>
                            <DialogDescription>
                                Track your proficiency in a new skill.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Skill Name</Label>
                                <Input
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    placeholder="e.g. React, Python, Communication"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Proficiency</Label>
                                    <span className="text-sm text-muted-foreground">{newSkillPercentage}%</span>
                                </div>
                                <Slider
                                    value={[newSkillPercentage]}
                                    onValueChange={(vals) => setNewSkillPercentage(vals[0])}
                                    max={100}
                                    step={5}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={() => addMutation.mutate()} disabled={!newSkillName || addMutation.isPending}>
                                Add Skill
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading skills...</div>
                ) : skills?.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No skills added yet.</div>
                ) : (
                    skills?.map((skill: any) => (
                        <div key={skill.id} className="flex items-center gap-4 p-3 border rounded-lg bg-card">
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{skill.skill_name}</span>
                                    {editingSkillId === skill.id ? (
                                        <span className="text-sm font-bold text-primary">{editPercentage}%</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">{skill.percentage}%</span>
                                    )}
                                </div>
                                {editingSkillId === skill.id ? (
                                    <Slider
                                        value={[editPercentage]}
                                        onValueChange={(vals) => setEditPercentage(vals[0])}
                                        max={100}
                                        step={5}
                                        className="py-1"
                                    />
                                ) : (
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${skill.percentage}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1">
                                {editingSkillId === skill.id ? (
                                    <>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(skill.id)}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingSkillId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => startEdit(skill)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteMutation.mutate(skill.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
