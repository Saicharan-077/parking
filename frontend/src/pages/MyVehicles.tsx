import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Car, Bike, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { vehicleApi, Vehicle } from "@/lib/api";

const MyVehicles = () => {
  const { toast } = useToast();
  const { data: vehicles, isLoading, error, refetch } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => vehicleApi.getAll(),
  });

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
                    <Button variant="outline" size="sm" className="flex-1">
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
      </div>
    </main>
  );
};

export default MyVehicles;
