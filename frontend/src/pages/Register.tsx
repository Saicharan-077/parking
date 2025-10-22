import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { vehicleApi, Vehicle } from "@/lib/api";

const Register = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vehicleType: "",
    vehicleNumber: "",
    model: "",
    color: "",
    isEV: false,
    ownerName: "",
    email: "",
    phoneNumber: "",
    employeeStudentId: "",
  });

  // Mutation for registering vehicle
  const registerMutation = useMutation({
    mutationFn: vehicleApi.register,
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Vehicle ${data.vehicle_number} registered successfully!`,
      });

      // Reset form
      setFormData({
        vehicleType: "",
        vehicleNumber: "",
        model: "",
        color: "",
        isEV: false,
        ownerName: "",
        email: "",
        phoneNumber: "",
        employeeStudentId: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.error || "Failed to register vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.vehicleType || !formData.vehicleNumber || !formData.ownerName || !formData.email || !formData.employeeStudentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for API
    const vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'> = {
      vehicle_type: formData.vehicleType as 'car' | 'bike' | 'ev',
      vehicle_number: formData.vehicleNumber,
      model: formData.model || undefined,
      color: formData.color || undefined,
      is_ev: formData.isEV,
      owner_name: formData.ownerName,
      email: formData.email,
      phone_number: formData.phoneNumber || undefined,
      employee_student_id: formData.employeeStudentId,
    };

    registerMutation.mutate(vehicleData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 vnr-fade-in">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Register Your Vehicle
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in the details below to register your vehicle in the VNR VJIET parking system
            </p>
          </div>

          {/* Registration Form */}
          <div className="vnr-card-gradient rounded-2xl shadow-large p-8 vnr-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label htmlFor="vehicleType" className="text-sm font-semibold text-foreground">
                  Vehicle Type *
                </Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => handleInputChange("vehicleType", value)}
                >
                  <SelectTrigger className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="ev">Electric Vehicle (EV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Number */}
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber" className="text-sm font-semibold text-foreground">
                  Vehicle Number *
                </Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  placeholder="Enter vehicle number (e.g., TS09EA1234)"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange("vehicleNumber", e.target.value.toUpperCase())}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-semibold text-foreground">
                  Model
                </Label>
                <Input
                  id="model"
                  type="text"
                  placeholder="Enter vehicle model (e.g., Honda City, Bajaj Pulsar)"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-semibold text-foreground">
                  Color
                </Label>
                <Input
                  id="color"
                  type="text"
                  placeholder="Enter vehicle color (e.g., White, Red, Blue)"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* EV Status */}
              <div className="flex items-center justify-between p-4 bg-vnr-blue/5 rounded-lg border border-vnr-blue/20">
                <div className="space-y-1">
                  <Label htmlFor="evStatus" className="text-sm font-semibold text-foreground">
                    Electric Vehicle (EV)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Is this an electric or hybrid vehicle?
                  </p>
                </div>
                <Switch
                  id="evStatus"
                  checked={formData.isEV}
                  onCheckedChange={(checked) => handleInputChange("isEV", checked)}
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-sm font-semibold text-foreground">
                  Owner Name *
                </Label>
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Employee/Student ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeStudentId" className="text-sm font-semibold text-foreground">
                  Employee/Student ID *
                </Label>
                <Input
                  id="employeeStudentId"
                  type="text"
                  placeholder="Enter your ID number"
                  value={formData.employeeStudentId}
                  onChange={(e) => handleInputChange("employeeStudentId", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-12 text-lg font-semibold bg-vnr-blue hover:bg-vnr-blue-dark text-white rounded-lg shadow-vnr hover:shadow-xl transition-all duration-300 vnr-hover-lift disabled:opacity-50"
              >
                {registerMutation.isPending ? "Registering..." : "Register Vehicle"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
