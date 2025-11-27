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

const studentProgressData = [
  { week: "Week 1", student1: 30, student2: 35, student3: 32, student4: 28 },
  { week: "Week 2", student1: 35, student2: 38, student3: 36, student4: 33 },
  { week: "Week 3", student1: 40, student2: 42, student3: 38, student4: 36 },
  { week: "Week 4", student1: 42, student2: 40, student3: 41, student4: 39 },
];

const pendingApprovals = [
  { student: "John Doe", summary: "Developed REST API endpoints", date: "2025-01-15", hours: 8 },
  { student: "Jane Smith", summary: "UI/UX design implementation", date: "2025-01-15", hours: 7 },
  { student: "Mike Johnson", summary: "Database optimization tasks", date: "2025-01-14", hours: 6 },
  { student: "Sarah Williams", summary: "Testing and bug fixes", date: "2025-01-14", hours: 8 },
];

const students = [
  { name: "John Doe", course: "Computer Science", hours: 193, completion: 85, rating: 4.5 },
  { name: "Jane Smith", course: "Information Technology", hours: 187, completion: 82, rating: 4.8 },
  { name: "Mike Johnson", course: "Computer Science", hours: 175, completion: 78, rating: 4.2 },
  { name: "Sarah Williams", course: "Software Engineering", hours: 201, completion: 90, rating: 4.9 },
];

const MentorDashboard = () => {
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
            <div className="text-2xl font-bold text-primary">4</div>
            <p className="text-xs text-muted-foreground">Active mentees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4</div>
            <p className="text-xs text-muted-foreground">Logs awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Student Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4.6</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
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
              <Line type="monotone" dataKey="student1" stroke="hsl(var(--chart-1))" name="John" />
              <Line type="monotone" dataKey="student2" stroke="hsl(var(--chart-2))" name="Jane" />
              <Line type="monotone" dataKey="student3" stroke="hsl(var(--chart-3))" name="Mike" />
              <Line type="monotone" dataKey="student4" stroke="hsl(var(--chart-4))" name="Sarah" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve student log submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{log.student}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.summary}</TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.hours}h</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <ThumbsDown className="h-3 w-3" />
                        Reject
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                <TableHead>Total Hours</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.hours}h</TableCell>
                  <TableCell>
                    <Badge variant={student.completion >= 80 ? "default" : "secondary"}>
                      {student.completion}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      {student.rating}
                    </div>
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
