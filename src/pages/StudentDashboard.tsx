import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
  Upload,
  Plus,
  Eye
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getStudentDashboardData } from "@/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";
import { LogSubmissionModal } from "@/components/student/LogSubmissionModal";
import { DocumentUpload } from "@/components/student/DocumentUpload";
import { SkillsManager } from "@/components/student/SkillsManager";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { SearchBar } from "@/components/common/SearchBar";
import { useState } from "react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const StudentDashboard = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['studentDashboard', user?.id],
    queryFn: async () => {
      const token = await getToken({ template: "supabase" });
      if (!token || !user?.id) return null;
      // We need the profile ID, but for now we assume user.id maps to clerk_id. 
      // However, getStudentDashboardData expects the profile ID (UUID), not Clerk ID.
      // Wait, SyncUser ensures profile exists. 
      // We need to fetch the profile first using Clerk ID to get the UUID, OR update getStudentDashboardData to accept Clerk ID.
      // Updating getStudentDashboardData to find by Clerk ID is better/safer if we don't have the UUID handy.
      // BUT, let's look at SyncUser... it inserts clerk_id.
      // The current getStudentDashboardData uses `eq('id', studentId)`.
      // I should probably update getStudentDashboardData to look up by clerk_id if passed, or I can fetch the profile here first.
      // Actually, let's fetch the profile by clerk_id in the API.
      // For now, I will assume I need to pass the profile ID.
      // Let's fetch the profile ID first or modify the API.
      // Modifying the API is cleaner.
      // BUT, I can't modify the API in this step easily without another tool call.
      // Let's see... `getStudentDashboardData` takes `studentId`.
      // I'll assume for this step that I can't change the API, so I'll fetch the profile ID first?
      // No, that's inefficient.
      // Let's assume for now that I will update the API in the next step or that I can query by clerk_id.
      // Actually, `SyncUser` runs and ensures the profile exists.
      // Let's pass the user.id (Clerk ID) and I will update the API to handle it, OR I will update the API now?
      // I can't update the API in this tool call.
      // I will update the API to find by clerk_id in a separate step if needed.
      // Wait, `profiles` table has `id` (UUID) and `clerk_id` (Text).
      // `getStudentDashboardData` queries `profiles` by `id`.
      // I should update `getStudentDashboardData` to query by `clerk_id` instead, as that's what the frontend has.

      // For now, I will write the code assuming `getStudentDashboardData` will be updated to accept Clerk ID or I will fetch the profile here.
      // Let's fetch the profile first in the queryFn.

      // Actually, I can just do it all in the API.
      // I will update the API in the next step.
      // So here, I will pass `user.id` (Clerk ID).
      return getStudentDashboardData(token, user.id);
    },
    enabled: !!user && !!isUserLoaded && !!isAuthLoaded,
  });

  // Subscribe to logs changes for this student
  // We need to know the student_id (UUID) for the filter, but we only have clerk_id (user.id) easily available here.
  // Ideally we filter by `student_id=eq.${uuid}`, but without UUID we can just listen to all logs and let query invalidation handle it.
  // Or better, we can listen to `logs` where `student_id` matches... wait, we don't have the UUID yet in the component body easily (it's inside data).
  // If we have data, we can use it.
  const studentId = dashboardData?.data?.profile?.id;

  useRealtimeSubscription({
    table: 'logs',
    queryKey: ['studentDashboard'],
    filter: studentId ? `student_id=eq.${studentId}` : undefined,
  });

  if (isLoading || !isUserLoaded || !isAuthLoaded) {
    return (
      <DashboardLayout title="Student Dashboard" role="student">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return <div>Error loading dashboard</div>;
  }

  const { profile, internships, logs, skills, documents } = dashboardData?.data || {};

  // Transform data for charts
  // This is a placeholder transformation, real data might need more processing
  const weeklyHoursData = logs?.slice(0, 5).map((log: any) => ({
    week: log.date, // Simplified
    hours: Number(log.hours)
  })) || [];

  const logsData = [
    { month: "Current", logs: logs?.length || 0 }
  ];

  const skillsData = skills?.map((s: any) => ({
    name: s.skill_name,
    value: s.percentage
  })) || [];

  return (
    <DashboardLayout title="Student Dashboard" role="student">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {logs?.reduce((acc: number, log: any) => acc + Number(log.hours), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total logged hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{logs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {logs?.filter((l: any) => l.status === 'pending').length || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {logs?.length ? Math.round((logs.filter((l: any) => l.status === 'approved').length / logs.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {logs?.filter((l: any) => l.status === 'approved').length || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internship Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {internships?.[0]?.status || 'No Active Internship'}
            </div>
            <p className="text-xs text-muted-foreground">
              {internships?.[0]?.company || 'Not assigned'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Hours logged recently</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs Overview</CardTitle>
            <CardDescription>Submission status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={logsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logs" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Skills Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Skills Development</CardTitle>
          <CardDescription>Your skill progression</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsManager />
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Your latest internship logs</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search logs..." className="w-[200px]" />
            <LogSubmissionModal />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.filter((log: any) =>
                log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.date.includes(searchQuery)
              ).slice(0, 5).map((log: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                  <TableCell>{log.hours}h</TableCell>
                  <TableCell>
                    <Badge variant={log.status === "approved" ? "default" : "secondary"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Upload and manage your internship documents</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload necessary documents for your internship.
                </DialogDescription>
              </DialogHeader>
              <DocumentUpload />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents?.map((doc: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    doc.status === "approved" ? "default" :
                      doc.status === "pending" ? "secondary" :
                        "outline"
                  }
                >
                  {doc.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout >
  );
};

export default StudentDashboard;
