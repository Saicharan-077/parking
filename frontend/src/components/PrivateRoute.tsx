// Import React hooks and components
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// Interface for PrivateRoute component props
interface PrivateRouteProps {
  children: React.ReactElement; // Child component to render if authenticated
  requiredRole?: string; // Optional role requirement for access
}

// Simple JWT token decoder function
const decodeJWT = (token: string) => {
  try {
    // Extract payload from JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 and parse JSON payload
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null; // Return null if decoding fails
  }
};

// PrivateRoute component for protecting routes that require authentication
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  // State for loading status during authentication check
  const [isLoading, setIsLoading] = useState(true);

  // State for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for role-based access control
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  // Effect to check authentication on component mount or role change
  useEffect(() => {
    const checkAuth = () => {
      // Retrieve JWT token from localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Decode JWT token to get payload
      const decoded = decodeJWT(token);
      if (!decoded) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Set authentication status
      setIsAuthenticated(true);

      // Check role requirements if specified
      if (requiredRole) {
        setHasRequiredRole(decoded.role === requiredRole);
      } else {
        setHasRequiredRole(true); // No role requirement, allow access
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [requiredRole]); // Re-run when requiredRole changes

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if authenticated but lacks required role
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // Render protected content if all checks pass
  return children;
};

export default PrivateRoute;
