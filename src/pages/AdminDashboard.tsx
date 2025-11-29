import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  Building2,
  CheckCircle2,
  UserPlus,
  Settings,
  Download,
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import { getAdminDashboardData } from "@/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignMentorModal } from "@/components/admin/AssignMentorModal";
import { SearchBar } from "@/components/common/SearchBar";
import { useState } from "react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AdminDashboard = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const token = await getToken({ template: "supabase" });
      if (!token) return null;
      return getAdminDashboardData(token);
    },
    enabled: !!user && !!isUserLoaded && !!isAuthLoaded,
  });

  if (isLoading || !isUserLoaded || !isAuthLoaded) {
    return (
      <DashboardLayout title="Admin Dashboard" role="admin">
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

  const { profiles, stats } = dashboardData?.data || {};

  // Placeholder data for charts (since we only fetch counts and profiles)
  // In a real app, we would fetch aggregated data for charts
  const companyData = [
    { name: "Tech Corp", value: 12 },
    { name: "Digital Solutions", value: 8 },
  ];

  const departmentData = [
    { dept: "Computer Science", students: 45 },
    { dept: "IT", students: 38 },
  ];

  const weeklyActivityData = [
    { week: "Week 1", submissions: 42, approvals: 38 },
    { week: "Week 2", submissions: 48, approvals: 45 },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalMentors || 0}</div>
            <p className="text-xs text-muted-foreground">Active faculty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.activeInternships || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalInternships || 0} total internships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Logs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.pendingLogs || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Distribution</CardTitle>
            <CardDescription>Students by company</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Manage student assignments</CardDescription>
            </div>
            <AssignMentorModal />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dept" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Log submissions and approvals over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submissions" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="approvals" stroke="hsl(var(--chart-2))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all registered users</CardDescription>
          </div>
          <div className="flex gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search users..." className="w-[200px]" />
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.filter((profile: any) =>
                profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((profile: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{profile.full_name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
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

export default AdminDashboard;
