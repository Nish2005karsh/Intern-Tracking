import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, FileText, Activity } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Sign Up",
    description: "Create your account and choose your role - Student, Mentor, or Admin.",
  },
  {
    icon: FileText,
    number: "02",
    title: "Add or Review Logs",
    description: "Students submit internship logs while mentors review and provide feedback.",
  },
  {
    icon: Activity,
    number: "03",
    title: "Track Progress",
    description: "Monitor performance through comprehensive analytics and visual dashboards.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-2">
                <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5">
                  {step.number}
                </div>
                <CardContent className="pt-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
