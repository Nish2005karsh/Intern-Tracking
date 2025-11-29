import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useAuth } from "@clerk/clerk-react";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { createLog } from "@/api/logs";
import { cn } from "@/lib/utils";
import { createAuthClient } from "@/lib/supabaseClient";

const formSchema = z.object({
    date: z.date({
        required_error: "A date is required.",
    }),
    hours: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0 && num <= 24 && num % 0.5 === 0;
    }, {
        message: "Hours must be between 0.5 and 24, in 0.5 increments.",
    }),
    description: z.string().min(50, {
        message: "Description must be at least 50 characters.",
    }),
});

export function LogSubmissionModal() {
    const [open, setOpen] = useState(false);
    const { user } = useUser();
    const { getToken } = useAuth(); // Although createLog uses supabase client directly, we might need token for RLS if not using cookie auth
    // Actually createLog uses supabase client. If we are using Clerk, we need to ensure supabase client has the token.
    // But `createLog` imports `supabase` from `@/lib/supabaseClient`.
    // We need to set the session on the supabase client before calling it, similar to `dashboardApi`.
    // Or we can update `createLog` to accept token.
    // For now, let's assume `dashboardApi`'s `setAuthToken` or similar mechanism is used globally, OR we pass token to `createLog`.
    // `createLog` currently doesn't take a token.
    // I should update `createLog` to take a token or handle auth.
    // But wait, `dashboardApi` has `withAuth`. `createLog` does not.
    // I should probably update `createLog` to use `withAuth` pattern or similar.
    // For this implementation, I'll fetch the token and set it on the global supabase client manually here if needed, 
    // but better to update `api/logs.ts` later.
    // For now, I'll just call `createLog` and assume the client is set up or I'll set the header manually here.

    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            hours: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");

            const client = createAuthClient(token);

            // We need the student_id (UUID) and mentor_id.
            // We can fetch them from the profile/student table.
            // Or we can pass them as props.
            // Fetching them here is safest.

            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            if (!profile) throw new Error("Profile not found");

            const { data: student } = await client
                .from('students')
                .select('student_id, mentor_id')
                .eq('student_id', profile.id)
                .single();

            if (!student) throw new Error("Student record not found");
            if (!student.mentor_id) throw new Error("You don't have a mentor assigned yet.");

            return createLog(client, {
                student_id: student.student_id,
                mentor_id: student.mentor_id,
                date: values.date,
                hours: parseFloat(values.hours),
                description: values.description,
            });
        },
        onSuccess: () => {
            toast.success("Log submitted successfully!");
            setOpen(false);
            form.reset();
            queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
        },
        onError: (error) => {
            toast.error(`Failed to submit log: ${error.message}`);
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Log
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Log</DialogTitle>
                    <DialogDescription>
                        Submit your daily internship activities.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hours Worked</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 8 or 4.5" {...field} type="number" step="0.5" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what you learned and accomplished today..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Log
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
