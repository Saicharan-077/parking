import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { authApi, RegisterRequest, SendEmailVerificationRequest, VerifyOTPRequest } from "@/lib/api";
import { UserPlus, Mail, Lock, Eye, EyeOff, Phone, CheckCircle } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    employeeStudentId: "",
  });

  const sendVerificationMutation = useMutation({
    mutationFn: (data: SendEmailVerificationRequest) => authApi.sendEmailVerification(data),
    onSuccess: () => {
      setStep('verify');
      setCountdown(60); // Start 60 second countdown
      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send verification code",
        variant: "destructive",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: VerifyOTPRequest) => authApi.verifyEmailOTP(data),
    onSuccess: () => {
      // After OTP verification, proceed with registration
      signupMutation.mutate(formData);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast({
        title: "Account Created Successfully",
        description: `Welcome, ${data.user.username}! Please log in to register your vehicles.`,
      });
      navigate("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.response?.data?.error || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'form') {
      if (!formData.username || !formData.email || !formData.password || !formData.phoneNumber || !formData.employeeStudentId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate email domain
      if (!formData.email.endsWith('@vnrvjiet.in')) {
        toast({
          title: "Invalid Email",
          description: "Only VNR VJIET email addresses (@vnrvjiet.in) are allowed",
          variant: "destructive",
        });
        return;
      }

      // Send verification code
      sendVerificationMutation.mutate({
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
    } else {
      // Verify OTP
      if (!otp || otp.length !== 6) {
        toast({
          title: "Validation Error",
          description: "Please enter the complete 6-digit verification code",
          variant: "destructive",
        });
        return;
      }
      verifyOTPMutation.mutate({
        email: formData.email,
        otp
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vnr-blue/5 via-background to-vnr-blue-muted/10 p-4">
      <Card className="w-full max-w-md vnr-glass border-vnr-blue/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-vnr-blue">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-vnr-blue">Create Account</CardTitle>
          <CardDescription>
            Create your VNR Parking Pilot account (VNR VJIET members only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">VNR VJIET Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.name@vnrvjiet.in"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only VNR VJIET email addresses are allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeStudentId">Employee/Student ID</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="employeeStudentId"
                  name="employeeStudentId"
                  type="text"
                  placeholder="Enter your ID"
                  value={formData.employeeStudentId}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
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

            {step === 'verify' && (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to your phone
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      sendVerificationMutation.mutate({
                        email: formData.email,
                        phoneNumber: formData.phoneNumber
                      });
                    }}
                    disabled={countdown > 0 || sendVerificationMutation.isPending}
                    className="text-xs"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-vnr-blue hover:bg-vnr-blue-dark"
              disabled={sendVerificationMutation.isPending || verifyOTPMutation.isPending || signupMutation.isPending}
            >
              {sendVerificationMutation.isPending && "Sending Code..."}
              {verifyOTPMutation.isPending && "Verifying..."}
              {signupMutation.isPending && "Creating Account..."}
              {step === 'form' && !sendVerificationMutation.isPending && "Send Verification Code"}
              {step === 'verify' && !verifyOTPMutation.isPending && !signupMutation.isPending && "Verify & Sign Up"}
            </Button>

            {step === 'verify' && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('form')}
                disabled={sendVerificationMutation.isPending || verifyOTPMutation.isPending || signupMutation.isPending}
              >
                Back to Form
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-vnr-blue hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
