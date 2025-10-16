// Import React Router hooks for navigation and location
import { Link, useLocation, useNavigate } from "react-router-dom";

// Import React hooks for state management
import { useState, useEffect } from "react";

// Import UI components
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Import icons from Lucide React
import { LogOut, User, Settings } from "lucide-react";

// Import logo asset
import vnrLogo from "@/assets/vnr-logo.png";

// Import user type definition
import { User as UserType } from "@/lib/api";

// Header component for navigation and user authentication display
const Header = () => {
  // Hooks for routing and navigation
  const location = useLocation();
  const navigate = useNavigate();

  // Hook for toast notifications
  const { toast } = useToast();

  // State for current authenticated user
  const [user, setUser] = useState<UserType | null>(null);

  // Effect to check authentication status on mount and route changes
  useEffect(() => {
    // Retrieve stored user data and token from localStorage
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser)); // Parse and set user data
    } else {
      setUser(null); // Clear user state if no valid data
    }
  }, [location]); // Re-run when location changes

  // Helper function to check if current path is active
  const isActive = (path: string) => location.pathname === path;

  // Handler for user logout
  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null); // Clear user state

    // Show logout success toast
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });

    // Navigate to home page
    navigate("/");
  };

  return (
    // Sticky header with glass effect and border
    <header className="vnr-glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center space-x-4">
            {/* VNR VJIET Logo */}
            <img
              src={vnrLogo}
              alt="VNR VJIET Logo"
              className="h-10 w-10 rounded-lg"
            />
            {/* Brand name and subtitle */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-vnr-blue">VNR VJIET</span>
              <span className="text-sm text-muted-foreground font-medium">
                VNR Parking Pilot
              </span>
            </div>
          </div>

          {/* Right side - Navigation menu */}
          <nav className="flex items-center space-x-2">
            {/* Home navigation link */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive("/")
                  ? "bg-vnr-blue-dark text-white shadow-vnr"
                  : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
              }`}
            >
              Home
            </Link>

            {user ? (
              // Navigation for authenticated users
              <>
                {/* Vehicle registration link */}
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive("/register")
                      ? "bg-vnr-blue-dark text-white shadow-vnr"
                      : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
                  }`}
                >
                  Register
                </Link>
                {/* User's vehicles link */}
                <Link
                  to="/my-vehicles"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive("/my-vehicles")
                      ? "bg-vnr-blue-dark text-white shadow-vnr"
                      : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
                  }`}
                >
                  My Vehicles
                </Link>

                {/* User dropdown menu */}
                <div className="relative group">
                  {/* User button with icon and username */}
                  <Button
                    variant="ghost"
                    className="bg-vnr-blue text-white hover:bg-vnr-blue-dark flex items-center space-x-2 px-3 py-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>

                  {/* Dropdown menu content */}
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      {/* User info section */}
                      <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-xs">{user.email}</p>
                        {/* Role badge */}
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Admin panel link (only for admins) */}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      {/* Logout button */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Navigation for unauthenticated users
              <>
                {/* Sign up link */}
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive("/signup")
                      ? "bg-vnr-blue-dark text-white shadow-vnr"
                      : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
                  }`}
                >
                  Sign Up
                </Link>
                {/* Vehicle registration link */}
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive("/register")
                      ? "bg-vnr-blue-dark text-white shadow-vnr"
                      : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
                  }`}
                >
                  Register Vehicle
                </Link>
                {/* Login link */}
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive("/login")
                      ? "bg-vnr-blue-dark text-white shadow-vnr"
                      : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
                  }`}
                >
                  Login
                </Link>
              </>
            )}

            {/* Help link (always visible) */}
            <Link
              to="/help"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive("/help")
                  ? "bg-vnr-blue-dark text-white shadow-vnr"
                  : "bg-vnr-blue text-white hover:bg-vnr-blue-dark"
              }`}
            >
              Help
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
