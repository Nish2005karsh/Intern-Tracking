import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SITS</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#home" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © 2025 College Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
