import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/dashboard-hero.jpg";

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Manage Internships Easily —{" "}
              <span className="text-primary">For Students & Teachers</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A simple platform to track logs, monitor progress, and streamline internship evaluations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/student">
                <Button size="lg" variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Dashboard Preview
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <img
              src={heroImage}
              alt="Dashboard Preview"
              className="relative rounded-lg shadow-2xl border border-border"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
