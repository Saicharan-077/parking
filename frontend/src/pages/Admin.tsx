import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { exportApi, vehicleApi, Vehicle } from "@/lib/api";
import { Download, FileText, BarChart3, Users, Car, Zap, Search, Palette } from "lucide-react";


const Admin = () => {
  const { toast } = useToast();
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Vehicle[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["vehicle-stats"],
    queryFn: vehicleApi.getStats,
  });

  const { data: exportStats } = useQuery({
    queryKey: ["export-stats"],
    queryFn: exportApi.getExportStats,
  });

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const blob = await exportApi.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vehicles_export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.response?.data?.error || "Failed to export CSV",
        variant: "destructive",
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const blob = await exportApi.exportPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vehicles_report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "PDF report has been downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.response?.data?.error || "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await vehicleApi.search(searchQuery.trim());
      setSearchResults(results);
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.response?.data?.error || "Failed to search vehicles",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vnr-blue/5 via-background to-vnr-blue-muted/10 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vnr-blue mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage vehicles, view statistics, and export data
        </p>
      </div>

      {/* Search Section */}
      <Card className="vnr-glass border-vnr-blue/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Vehicles</span>
          </CardTitle>
          <CardDescription>
            Search vehicles by vehicle number, owner name, email, or employee/student ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter search query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              Search
            </Button>
            <Button variant="outline" onClick={handleClearSearch} disabled={isSearching && !searchQuery}>
              Clear
            </Button>
          </div>

          {searchResults && searchResults.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vehicle Number</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Employee/Student ID</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>EV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.id}</TableCell>
                    <TableCell>{vehicle.vehicle_number}</TableCell>
                    <TableCell>{vehicle.owner_name}</TableCell>
                    <TableCell>{vehicle.email}</TableCell>
                    <TableCell>{vehicle.employee_student_id}</TableCell>
                    <TableCell>{vehicle.vehicle_type}</TableCell>
                    <TableCell>{vehicle.model || '-'}</TableCell>
                    <TableCell>{vehicle.color || '-'}</TableCell>
                    <TableCell>{vehicle.is_ev ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {searchResults && searchResults.length === 0 && (
            <p className="text-muted-foreground">No vehicles found for the search query.</p>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="vnr-glass border-vnr-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-vnr-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vnr-blue">
              {stats?.total_vehicles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="vnr-glass border-vnr-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EV Vehicles</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.total_ev || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Electric vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="vnr-glass border-vnr-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Cars</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total_cars || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Standard vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="vnr-glass border-vnr-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motorcycles</CardTitle>
            <Car className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.total_bikes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Two-wheelers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="vnr-glass border-vnr-blue/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Export</span>
          </CardTitle>
          <CardDescription>
            Export vehicle data in various formats for reporting and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleExportCSV}
              disabled={isExportingCSV}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4" />
              <span>{isExportingCSV ? "Exporting..." : "Export CSV"}</span>
            </Button>

            <Button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
            >
              <FileText className="h-4 w-4" />
              <span>{isExportingPDF ? "Exporting..." : "Export PDF"}</span>
            </Button>
          </div>

          {exportStats && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="ml-2 font-medium">{exportStats.totalVehicles}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">EV Vehicles:</span>
                  <span className="ml-2 font-medium text-green-600">{exportStats.evVehicles}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cars:</span>
                  <span className="ml-2 font-medium text-blue-600">{exportStats.carVehicles}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bikes:</span>
                  <span className="ml-2 font-medium text-orange-600">{exportStats.bikeVehicles}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="vnr-glass border-vnr-blue/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-20 flex-col space-y-2 bg-vnr-blue text-white hover:bg-vnr-blue-dark"
              onClick={() => toast({
                title: "Manage Users",
                description: "User management functionality is coming soon. Currently, users can register and login through the main application.",
              })}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>

            <Button
              className="h-20 flex-col space-y-2 bg-vnr-blue text-white hover:bg-vnr-blue-dark"
              onClick={() => toast({
                title: "View Reports",
                description: `Current system status: ${stats?.total_vehicles || 0} vehicles registered, ${stats?.total_ev || 0} electric vehicles, ${stats?.total_cars || 0} cars, ${stats?.total_bikes || 0} bikes.`,
              })}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 flex-col space-y-2 bg-vnr-blue text-white hover:bg-vnr-blue-dark">
                  <Palette className="h-6 w-6" />
                  <span>System Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>System Settings</DialogTitle>
                  <DialogDescription>
                    Configure system preferences and appearance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Theme</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <p className="text-sm text-muted-foreground">Theme management has been simplified to light mode only.</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">System Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Database: SQLite</p>
                      <p>Authentication: JWT</p>
                      <p>Email Service: Enabled</p>
                      <p>Current Theme: Light</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default Admin;
