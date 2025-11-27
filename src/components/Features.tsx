import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Student Tracking",
    description: "Students add daily/weekly logs and internship details effortlessly.",
  },
  {
    icon: Users,
    title: "Mentor Review",
    description: "Teachers approve logs and provide valuable feedback to guide students.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visual charts showing progress, hours worked, and completion rates.",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description: "Fast login & user management with enterprise-grade security.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage internships effectively
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
