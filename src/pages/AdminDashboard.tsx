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

const companyData = [
  { name: "Tech Corp", value: 12 },
  { name: "Digital Solutions", value: 8 },
  { name: "Innovation Labs", value: 6 },
  { name: "Software Inc", value: 5 },
  { name: "Others", value: 9 },
];

const departmentData = [
  { dept: "Computer Science", students: 45 },
  { dept: "IT", students: 38 },
  { dept: "Software Eng", students: 32 },
  { dept: "Data Science", students: 25 },
];

const weeklyActivityData = [
  { week: "Week 1", submissions: 42, approvals: 38 },
  { week: "Week 2", submissions: 48, approvals: 45 },
  { week: "Week 3", submissions: 51, approvals: 47 },
  { week: "Week 4", submissions: 55, approvals: 52 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const studentsList = [
  { name: "John Doe", course: "CS", mentor: "Dr. Smith", status: "Active" },
  { name: "Jane Smith", course: "IT", mentor: "Prof. Johnson", status: "Active" },
  { name: "Mike Johnson", course: "CS", mentor: "Dr. Smith", status: "Active" },
  { name: "Sarah Williams", course: "SE", mentor: "Dr. Brown", status: "Completed" },
];

const internshipsList = [
  { company: "Tech Corp", student: "John Doe", duration: "Jan-Jun 2025", status: "Ongoing" },
  { company: "Digital Solutions", student: "Jane Smith", duration: "Jan-Jun 2025", status: "Ongoing" },
  { company: "Innovation Labs", student: "Mike Johnson", duration: "Dec-May 2025", status: "Ongoing" },
  { company: "Software Inc", student: "Sarah Williams", duration: "Sep-Dec 2024", status: "Completed" },
];

const AdminDashboard = () => {
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
            <div className="text-2xl font-bold text-primary">140</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">18</div>
            <p className="text-xs text-muted-foreground">Active faculty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">127</div>
            <p className="text-xs text-muted-foreground">13 pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">45</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
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
          <CardHeader>
            <CardTitle>Department-wise Activity</CardTitle>
            <CardDescription>Active students by department</CardDescription>
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

      {/* Student Table */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>Manage all registered students</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsList.map((student, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.mentor}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                      {student.status}
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

      {/* Internship Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Internship Management</CardTitle>
            <CardDescription>Monitor all internship programs</CardDescription>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internshipsList.map((internship, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{internship.company}</TableCell>
                  <TableCell>{internship.student}</TableCell>
                  <TableCell>{internship.duration}</TableCell>
                  <TableCell>
                    <Badge variant={internship.status === "Ongoing" ? "default" : "secondary"}>
                      {internship.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View Details</Button>
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
