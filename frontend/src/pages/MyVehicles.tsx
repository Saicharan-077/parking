import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Car, Bike, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { vehicleApi, Vehicle } from "@/lib/api";

const MyVehicles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: vehicles, isLoading, error, refetch } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => vehicleApi.getAll(),
  });

  // State for edit dialog
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
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

  // Mutation for updating vehicle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Vehicle> }) => vehicleApi.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Vehicle updated successfully!",
      });
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditFormData({
      vehicleType: vehicle.vehicle_type,
      vehicleNumber: vehicle.vehicle_number,
      model: vehicle.model || "",
      color: vehicle.color || "",
      isEV: vehicle.is_ev,
      ownerName: vehicle.owner_name,
      email: vehicle.email,
      phoneNumber: vehicle.phone_number || "",
      employeeStudentId: vehicle.employee_student_id,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVehicle) return;

    // Validate required fields
    if (!editFormData.vehicleType || !editFormData.vehicleNumber || !editFormData.ownerName || !editFormData.email || !editFormData.employeeStudentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for API
    const updateData: Partial<Vehicle> = {
      vehicle_type: editFormData.vehicleType as 'car' | 'bike' | 'ev',
      vehicle_number: editFormData.vehicleNumber,
      model: editFormData.model || undefined,
      color: editFormData.color || undefined,
      is_ev: editFormData.isEV,
      owner_name: editFormData.ownerName,
      email: editFormData.email,
      phone_number: editFormData.phoneNumber || undefined,
      employee_student_id: editFormData.employeeStudentId,
    };

    updateMutation.mutate({ id: editingVehicle.id!, data: updateData });
  };

  const handleEditInputChange = (field: string, value: string | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleApi.delete(id);
        toast({
          title: "Success",
          description: "Vehicle deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete vehicle",
          variant: "destructive",
        });
      }
    }
  };

  const getVehicleIcon = (type: string, isEv: boolean) => {
    if (isEv) return <Zap className="w-5 h-5 text-green-500" />;
    return type === "bike" ? <Bike className="w-5 h-5 text-blue-500" /> : <Car className="w-5 h-5 text-blue-600" />;
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case "car": return "bg-blue-100 text-blue-800";
      case "bike": return "bg-green-100 text-green-800";
      case "ev": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vnr-blue mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your vehicles...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500">Error loading vehicles. Please try again.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 vnr-fade-in">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            My Vehicles
          </h1>
          <p className="text-lg text-muted-foreground">
            View and manage all your registered vehicles
          </p>
        </div>

        {/* Vehicles Grid */}
        {vehicles && vehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="vnr-card-gradient shadow-large hover:shadow-xl transition-all duration-300 vnr-hover-lift">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getVehicleIcon(vehicle.vehicle_type, vehicle.is_ev)}
                      <div>
                        <CardTitle className="text-lg">{vehicle.vehicle_number}</CardTitle>
                        <CardDescription>{vehicle.model}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getVehicleTypeColor(vehicle.vehicle_type)}>
                      {vehicle.vehicle_type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Color:</span>
                      <span className="text-sm font-semibold">{vehicle.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Owner:</span>
                      <span className="text-sm font-semibold">{vehicle.owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <span className="text-sm font-semibold">{vehicle.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">ID:</span>
                      <span className="text-sm font-semibold">{vehicle.employee_student_id}</span>
                    </div>
                    {vehicle.is_ev && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-600">Status:</span>
                        <span className="text-sm font-semibold text-green-600">Electric Vehicle</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-vnr-blue/10 rounded-full flex items-center justify-center mb-4">
              🚗
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Vehicles Registered</h3>
            <p className="text-muted-foreground mb-6">You haven't registered any vehicles yet.</p>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-vnr-blue hover:bg-vnr-blue-dark rounded-xl shadow-vnr hover:shadow-xl transition-all duration-300"
            >
              Register Your First Vehicle
            </a>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>
                Update the details of your vehicle registration.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label htmlFor="edit-vehicleType" className="text-sm font-semibold text-foreground">
                  Vehicle Type *
                </Label>
                <Select
                  value={editFormData.vehicleType}
                  onValueChange={(value) => handleEditInputChange("vehicleType", value)}
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
                <Label htmlFor="edit-vehicleNumber" className="text-sm font-semibold text-foreground">
                  Vehicle Number *
                </Label>
                <Input
                  id="edit-vehicleNumber"
                  type="text"
                  placeholder="Enter vehicle number (e.g., TS09EA1234)"
                  value={editFormData.vehicleNumber}
                  onChange={(e) => handleEditInputChange("vehicleNumber", e.target.value.toUpperCase())}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="edit-model" className="text-sm font-semibold text-foreground">
                  Model
                </Label>
                <Input
                  id="edit-model"
                  type="text"
                  placeholder="Enter vehicle model (e.g., Honda City, Bajaj Pulsar)"
                  value={editFormData.model}
                  onChange={(e) => handleEditInputChange("model", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="edit-color" className="text-sm font-semibold text-foreground">
                  Color
                </Label>
                <Input
                  id="edit-color"
                  type="text"
                  placeholder="Enter vehicle color (e.g., White, Red, Blue)"
                  value={editFormData.color}
                  onChange={(e) => handleEditInputChange("color", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* EV Status */}
              <div className="flex items-center justify-between p-4 bg-vnr-blue/5 rounded-lg border border-vnr-blue/20">
                <div className="space-y-1">
                  <Label htmlFor="edit-evStatus" className="text-sm font-semibold text-foreground">
                    Electric Vehicle (EV)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Is this an electric or hybrid vehicle?
                  </p>
                </div>
                <Switch
                  id="edit-evStatus"
                  checked={editFormData.isEV}
                  onCheckedChange={(checked) => handleEditInputChange("isEV", checked)}
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-ownerName" className="text-sm font-semibold text-foreground">
                  Owner Name *
                </Label>
                <Input
                  id="edit-ownerName"
                  type="text"
                  placeholder="Enter full name"
                  value={editFormData.ownerName}
                  onChange={(e) => handleEditInputChange("ownerName", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-semibold text-foreground">
                  Email *
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email address"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange("email", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="edit-phoneNumber" className="text-sm font-semibold text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={editFormData.phoneNumber}
                  onChange={(e) => handleEditInputChange("phoneNumber", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Employee/Student ID */}
              <div className="space-y-2">
                <Label htmlFor="edit-employeeStudentId" className="text-sm font-semibold text-foreground">
                  Employee/Student ID *
                </Label>
                <Input
                  id="edit-employeeStudentId"
                  type="text"
                  placeholder="Enter your ID number"
                  value={editFormData.employeeStudentId}
                  onChange={(e) => handleEditInputChange("employeeStudentId", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full h-12 text-lg font-semibold bg-vnr-blue hover:bg-vnr-blue-dark text-white rounded-lg shadow-vnr hover:shadow-xl transition-all duration-300 vnr-hover-lift disabled:opacity-50"
              >
                {updateMutation.isPending ? "Updating..." : "Update Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default MyVehicles;
