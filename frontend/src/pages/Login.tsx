import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi, LoginRequest } from "@/lib/api";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });

      // Redirect based on user role
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/my-vehicles");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vnr-blue/5 via-background to-vnr-blue-muted/10 p-4">
      <Card className="w-full max-w-md vnr-glass border-vnr-blue/20 mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-vnr-blue">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-vnr-blue">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your VNR Parking Pilot account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-vnr-blue hover:bg-vnr-blue-dark"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-vnr-blue hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-vnr-blue-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Admin: mani@example.com / mani123<br />
              User: sai@example.com / sai123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
