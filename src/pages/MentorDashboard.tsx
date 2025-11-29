import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  CheckCircle2,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getMentorDashboardData } from "@/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingApprovals } from "@/components/mentor/PendingApprovals";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { SearchBar } from "@/components/common/SearchBar";
import { useState } from "react";

const MentorDashboard = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['mentorDashboard', user?.id],
    queryFn: async () => {
      const token = await getToken({ template: "supabase" });
      if (!token || !user?.id) return null;
      // Similar to StudentDashboard, we are passing Clerk ID.
      // Ideally we should pass the profile ID (UUID).
      // For now, assuming the API will handle Clerk ID or we update it later.
      return getMentorDashboardData(token, user.id);
    },
    enabled: !!user && !!isUserLoaded && !!isAuthLoaded,
  });

  const mentorId = dashboardData?.data?.profile?.id;

  // Subscribe to logs changes (new submissions)
  useRealtimeSubscription({
    table: 'logs',
    queryKey: ['mentorDashboard'],
    filter: mentorId ? `mentor_id=eq.${mentorId}` : undefined,
  });

  // Also subscribe to pending logs specifically if we want faster updates there, 
  // but invalidating 'mentorDashboard' should cover it if it fetches everything.
  // PendingApprovals component fetches 'pendingLogs' separately, so we should invalidate that too.
  // We can add another subscription in PendingApprovals or just invalidate both here.
  // Actually, let's add it in PendingApprovals for better encapsulation.

  if (isLoading || !isUserLoaded || !isAuthLoaded) {
    return (
      <DashboardLayout title="Mentor Dashboard" role="mentor">
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

  const { profile, students, logs, reviews } = dashboardData?.data || {};

  // Calculate stats
  const activeMentees = students?.length || 0;
  const pendingLogs = logs?.filter((l: any) => l.status === 'pending') || [];
  const logsThisWeek = logs?.filter((l: any) => {
    // Simple check for "this week" (last 7 days)
    const logDate = new Date(l.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return logDate >= oneWeekAgo;
  }).length || 0;

  const avgRating = reviews?.length
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  // Placeholder for chart data - would need real aggregation
  const studentProgressData = [
    { week: "Week 1", student1: 30, student2: 35 },
    { week: "Week 2", student1: 35, student2: 38 },
  ];

  return (
    <DashboardLayout title="Mentor Dashboard" role="mentor">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeMentees}</div>
            <p className="text-xs text-muted-foreground">Active mentees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingLogs.length}</div>
            <p className="text-xs text-muted-foreground">Logs awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Student Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{logsThisWeek}</div>
            <p className="text-xs text-muted-foreground">From last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Progress Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Student Progress Comparison</CardTitle>
          <CardDescription>Weekly hours worked by each student</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={studentProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="student1" stroke="hsl(var(--chart-1))" name="Student 1" />
              <Line type="monotone" dataKey="student2" stroke="hsl(var(--chart-2))" name="Student 2" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and approve student log submissions</CardDescription>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search pending..." className="w-[250px]" />
        </CardHeader>
        <CardContent>
          <PendingApprovals searchQuery={searchQuery} />
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
          <CardDescription>Overview of all assigned students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((student: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{student.profiles?.full_name}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default MentorDashboard;
