import Landing from "./Landing";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = user.publicMetadata.role as string;
      if (role === 'student') {
        navigate('/student');
      } else if (role === 'mentor') {
        navigate('/mentor');
      } else if (role === 'admin') {
        navigate('/admin');
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Landing />;
};

export default Index;
