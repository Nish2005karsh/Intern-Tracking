import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

const Auth = () => {
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
      } else {
        navigate('/');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold">SITS</span>
        </Link>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="flex justify-center">
            <SignIn forceRedirectUrl="/" />
          </TabsContent>

          <TabsContent value="signup" className="flex justify-center">
            <SignUp forceRedirectUrl="/" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
