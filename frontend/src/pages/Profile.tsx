import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi, User, UpdateProfileRequest } from "@/lib/api";
import { User as UserIcon, Mail, Phone, IdCard, Save, Loader2, Camera, Upload } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    employeeStudentId: "",
    profilePicture: "",
  });

  // State for profile picture preview
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");

  // Fetch current user profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
    enabled: !!localStorage.getItem('authToken'),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Update local storage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profileData?.user) {
      setFormData({
        username: profileData.user.username || "",
        email: profileData.user.email || "",
        phoneNumber: profileData.user.phone_number || "",
        employeeStudentId: profileData.user.employee_student_id || "",
        profilePicture: profileData.user.profile_picture || "",
      });
      setProfilePicturePreview(profileData.user.profile_picture || "");
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicturePreview(result);
        setFormData(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.username || !formData.email || !formData.employeeStudentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdateProfileRequest = {
      username: formData.username,
      phoneNumber: formData.phoneNumber || undefined,
      employeeStudentId: formData.employeeStudentId,
      profilePicture: formData.profilePicture || undefined,
    };

    updateProfileMutation.mutate(updateData);
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and account details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-foreground">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={handleProfilePictureUpload}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleProfilePictureUpload}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                  disabled // Email typically shouldn't be editable
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="h-12 rounded-lg border-2 border-input focus:border-vnr-blue"
                />
              </div>

              {/* Employee/Student ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeStudentId" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
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

              {/* Role (read-only) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Role</Label>
                <Input
                  type="text"
                  value={profileData?.user?.role || ""}
                  className="h-12 rounded-lg border-2 border-input bg-muted"
                  disabled
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full h-12 text-lg font-semibold bg-vnr-blue hover:bg-vnr-blue-dark text-white rounded-lg shadow-vnr hover:shadow-xl transition-all duration-300 vnr-hover-lift disabled:opacity-50 flex items-center gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
