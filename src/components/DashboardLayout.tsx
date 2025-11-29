
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { NotificationBell } from "./common/NotificationBell";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: string;
}

const DashboardLayout = ({ children, title, role }: DashboardLayoutProps) => {

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <span className="text-xl font-bold">SITS</span>
              <span className="text-xs text-muted-foreground ml-2 capitalize">{role}</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
