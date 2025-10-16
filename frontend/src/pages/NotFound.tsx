import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-vnr-blue">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-vnr-blue hover:bg-vnr-blue-dark rounded-lg shadow-vnr hover:shadow-xl transition-all duration-300 vnr-hover-lift"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
