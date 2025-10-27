// Import UI components for notifications and tooltips
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import React Query for data fetching and caching
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import React Router for client-side routing
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Google OAuth provider
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import page components
import Header from "./components/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import MyVehicles from "./pages/MyVehicles";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Import private route component for authentication
import PrivateRoute from "./components/PrivateRoute";

// Create React Query client instance for data management
const queryClient = new QueryClient();

// Main App component that sets up the application structure
const App = () => (
  // Provide Google OAuth context to the entire app
  <GoogleOAuthProvider clientId="your-google-client-id">
    {/* Provide React Query client to the entire app */}
    <QueryClientProvider client={queryClient}>
      {/* Provide tooltip context for UI components */}
      <TooltipProvider>
        {/* Toast notification components */}
        <Toaster />
        <Sonner />
        {/* Browser router for client-side navigation */}
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            {/* Application header */}
            <Header />
            {/* Define application routes */}
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/help" element={<Help />} />

              {/* Protected routes requiring authentication */}
              <Route
                path="/register"
                element={
                  <PrivateRoute>
                    <Register />
                  </PrivateRoute>
                }
              />

              {/* Protected routes requiring authentication */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Admin />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-vehicles"
                element={
                  <PrivateRoute>
                    <MyVehicles />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Catch-all route for 404 pages - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
