"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";
import { readersApi, staffApi } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Edit2,
  Save,
  X,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProfileField {
  label: string;
  value: string;
  editable: boolean;
  type: "text" | "email" | "tel";
  icon: React.ElementType;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: "", // TODO: Get from user data if available
        address: "", // TODO: Get from user data if available
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditMode = () => {
    // Ensure form data is current when entering edit mode
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: formData.phone, // Keep current phone/address values
      address: formData.address,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (user?.role === "reader") {
        // For readers, use the readers API
        const updateData: any = {};

        // Map form fields to API fields for readers
        if (formData.name !== user.name) {
          const [firstName, ...lastNameParts] = formData.name.split(" ");
          updateData.reader_fname = firstName || "";
          updateData.reader_lname = lastNameParts.join(" ") || "";
        }

        if (formData.email !== user.email) {
          updateData.reader_email = formData.email;
        }

        if (formData.phone) {
          updateData.reader_contact = formData.phone;
        }

        if (formData.address) {
          updateData.reader_address = formData.address;
        }

        if (Object.keys(updateData).length > 0) {
          const response = await readersApi.updateMe(updateData);

          // Update local state with the response data
          updateUser({
            name: `${response.data.reader_fname} ${response.data.reader_lname}`.trim(),
            email: response.data.reader_email,
          });
        }
      } else if (user?.role === "admin" || user?.role === "librarian") {
        // For staff (admin/librarian), use the staff API
        const updateData: any = {};

        // Map form fields to API fields for staff
        if (formData.name !== user.name) {
          const [firstName, ...lastNameParts] = formData.name.split(" ");
          updateData.staff_fname = firstName || "";
          updateData.staff_lname = lastNameParts.join(" ") || "";
        }

        if (formData.email !== user.email) {
          updateData.staff_email = formData.email;
        }

        if (Object.keys(updateData).length > 0) {
          const response = await staffApi.updateMe(updateData);

          // Update local state with the response data
          updateUser({
            name: `${response.data.staff_fname} ${response.data.staff_lname}`.trim(),
            email: response.data.staff_email,
          });
        }
      }

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user values when canceling
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: formData.phone, // Keep current phone/address values
      address: formData.address,
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    try {
      // Validate password fields
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        toast.error("Please fill in all password fields");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        return;
      }

      setLoading(true);

      const updateData = {
        passwordCurrent: passwordData.currentPassword,
        password: passwordData.newPassword,
        passwordConfirm: passwordData.newPassword,
      };

      if (user?.role === "reader") {
        await readersApi.updateMyPassword(updateData);
      } else if (user?.role === "admin" || user?.role === "librarian") {
        await staffApi.updateMyPassword(updateData);
      }

      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "librarian":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reader":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
      case "librarian":
        return Shield;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon(user?.role || "");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and personal information
            </p>
          </div>
          {!isEditing ? (
            <Button
              onClick={handleEditMode}
              className="flex items-center space-x-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? "Saving..." : "Save"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-xl">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="flex justify-center mt-3">
                <Badge
                  variant="outline"
                  className={`capitalize ${getRoleColor(user?.role || "")}`}
                >
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {user?.role}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-white text-black flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder={user?.name || "Enter your full name"}
                    />
                  ) : (
                    <p className="text-sm dark:text-gray-200 text-gray-800 py-2">
                      {user?.name || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-white text-black flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder={user?.email || "Enter your email address"}
                    />
                  ) : (
                    <p className="text-sm dark:text-gray-200 text-gray-800 py-2">
                      {user?.email || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone and Address (if applicable for readers) */}
              {user?.role === "reader" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-white text-black flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder={
                          formData.phone || "Enter your phone number"
                        }
                      />
                    ) : (
                      <p className="text-sm dark:text-gray-200 text-gray-800 py-2">
                        {formData.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-white text-black flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Address
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder={formData.address || "Enter your address"}
                      />
                    ) : (
                      <p className="text-sm dark:text-gray-200 text-gray-800 py-2">
                        {formData.address || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Security</span>
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">
                    Change your account password
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center space-x-1"
                >
                  <Lock className="h-3 w-3" />
                  <span>Change Password</span>
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium">Account Role</h4>
                  <p className="text-sm text-gray-600">
                    Your current access level
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize ${getRoleColor(user?.role || "")}`}
                >
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {user?.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }}
          size="md"
          title="Change Password"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handlePasswordInputChange("currentPassword", e.target.value)
                }
                placeholder="Enter your current password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordInputChange("newPassword", e.target.value)
                }
                placeholder="Enter your new password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm your new password"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>{loading ? "Updating..." : "Update Password"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
