import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { Roles } from "@/types/globals";
import SyncUser from "./SyncUser";

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: Roles;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { isLoaded, isSignedIn, user } = useUser();
    const location = useLocation();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isSignedIn) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    const userRole = user?.publicMetadata?.role as Roles | undefined;

    if (role && userRole !== role && userRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <SyncUser />
            {children}
        </>
    );
};

export default ProtectedRoute;
