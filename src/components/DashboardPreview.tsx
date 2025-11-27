import studentPreview from "@/assets/student-dashboard-preview.jpg";
import adminPreview from "@/assets/admin-dashboard-preview.jpg";

const DashboardPreview = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Dashboard Preview</h2>
          <p className="text-xl text-muted-foreground">See what you'll be working with</p>
        </div>
        
        <div className="space-y-12">
          <div className="rounded-lg overflow-hidden border-2 border-border shadow-xl">
            <div className="bg-card p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Student Dashboard</h3>
              <p className="text-sm text-muted-foreground">Track your internship progress and submit logs</p>
            </div>
            <img src={studentPreview} alt="Student Dashboard" className="w-full" />
          </div>
          
          <div className="rounded-lg overflow-hidden border-2 border-border shadow-xl">
            <div className="bg-card p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Admin Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">Monitor all students and internships with comprehensive analytics</p>
            </div>
            <img src={adminPreview} alt="Admin Dashboard" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
