import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md glass shadow-premium border-border/50">
        <CardHeader className="text-center pb-8">
          <Logo size="lg" className="mx-auto mb-6" />
          <CardTitle className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </CardTitle>
          <CardDescription className="text-lg">
            Oops! This page doesn't exist
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> could not be found.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button 
              onClick={() => window.history.back()}
              variant="default"
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
