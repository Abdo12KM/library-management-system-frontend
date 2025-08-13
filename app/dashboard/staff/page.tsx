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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Form } from "@/components/ui/form";
import { TextField, SelectField } from "@/components/ui/form-fields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { staffApi } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  staffFormSchema,
  defaultStaffFormValues,
  transformStaffFormData,
} from "@/lib/validations/staff";
import type { StaffFormData, Staff } from "@/types";
import {
  Users,
  UserCheck,
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  SortAsc,
  Filter,
  Mail,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  // React Hook Form setup
  const addForm = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: defaultStaffFormValues,
  });

  const editForm = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: defaultStaffFormValues,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    let list = Array.isArray(staff) ? staff : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (member) =>
          member.staff_fname?.toLowerCase().includes(q) ||
          member.staff_lname?.toLowerCase().includes(q) ||
          member.staff_email?.toLowerCase().includes(q) ||
          member.role?.toLowerCase().includes(q),
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      list = list.filter((member) => member.role === roleFilter);
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = `${a.staff_fname} ${a.staff_lname}`.toLowerCase();
          bValue = `${b.staff_fname} ${b.staff_lname}`.toLowerCase();
          break;
        case "email":
          aValue = a.staff_email?.toLowerCase() || "";
          bValue = b.staff_email?.toLowerCase() || "";
          break;
        case "role":
          aValue = a.role?.toLowerCase() || "";
          bValue = b.role?.toLowerCase() || "";
          break;
        case "date":
        default:
          aValue = new Date(a.createdAt || "");
          bValue = new Date(b.createdAt || "");
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredStaff(list);
  }, [staff, searchTerm, sortBy, sortOrder, roleFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAll();
      setStaff(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError("Failed to load staff members");
      toast.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (data: StaffFormData) => {
    try {
      const staffData = transformStaffFormData(data);
      await staffApi.create(staffData);
      toast.success("Staff member created successfully");
      setShowAddModal(false);
      addForm.reset();
      fetchStaff();
    } catch (error) {
      toast.error("Failed to create staff member");
      console.error("Error creating staff member:", error);
    }
  };

  const handleEditStaff = async (data: StaffFormData) => {
    if (!editingStaff) return;

    try {
      const staffData = transformStaffFormData(data);
      await staffApi.update(editingStaff._id, staffData);
      toast.success("Staff member updated successfully");
      setShowEditModal(false);
      setEditingStaff(null);
      editForm.reset();
      fetchStaff();
    } catch (error) {
      toast.error("Failed to update staff member");
      console.error("Error updating staff member:", error);
    }
  };

  const openAddModal = () => {
    addForm.reset(defaultStaffFormValues);
    setShowAddModal(true);
  };

  const openEditModal = (member: Staff) => {
    const formValues = {
      staff_fname: member.staff_fname,
      staff_lname: member.staff_lname,
      staff_email: member.staff_email,
      role: member.role,
      password: "", // Don't populate password
    };

    editForm.reset(formValues);
    setEditingStaff(member);
    setShowEditModal(true);
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await staffApi.delete(id);
      toast.success("Staff member deleted successfully");
      fetchStaff();
      setShowDeleteDialog(false);
      setStaffToDelete(null);
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  };

  const openDeleteDialog = (id: string) => {
    setStaffToDelete(id);
    setShowDeleteDialog(true);
  };

  const getStaffStats = () => {
    const totalStaff = staff.length;
    const administrators = staff.filter(
      (member) => member.role === "admin",
    ).length;
    const librarians = staff.filter(
      (member) => member.role === "librarian",
    ).length;

    return { totalStaff, administrators, librarians };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "librarian":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const stats = getStaffStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading staff...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Staff Management
            </h1>
            <p className="text-muted-foreground">
              Manage staff members and their roles
            </p>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" />
            <span>Add Staff</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                Active staff members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administrators
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.administrators}</div>
              <p className="text-xs text-muted-foreground">System admins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Librarians</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.librarians}</div>
              <p className="text-xs text-muted-foreground">Library staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Staff Members</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Role: {roleFilter === "all" ? "All" : roleFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                      All Roles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRoleFilter("librarian")}
                    >
                      Librarian
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("name")}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("email")}>
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("role")}>
                      Role
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      Join Date
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Staff Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading staff...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Staff
              </h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchStaff} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((member) => (
              <Card key={member._id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {member.staff_fname} {member.staff_lname}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${getRoleColor(member.role)}`}
                        >
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedStaff(member)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(member._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{member.staff_email}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        Joined{" "}
                        {new Date(member.staff_join_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredStaff.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Staff Found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "No staff match your search criteria."
                  : "No staff members available."}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Staff Member
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedStaff && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStaff(null)}
          size="lg"
          title="Staff Details"
        >
          <div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Name:</span>
                <span>
                  {selectedStaff.staff_fname} {selectedStaff.staff_lname}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span>{selectedStaff.staff_email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Role:</span>
                <Badge
                  variant="outline"
                  className={`capitalize ${getRoleColor(selectedStaff.role)}`}
                >
                  {selectedStaff.role}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Join Date:</span>
                <span>
                  {new Date(selectedStaff.staff_join_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedStaff(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addForm.reset();
          }}
          size="lg"
          title="Add New Staff Member"
        >
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddStaff)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={addForm.control}
                  name="staff_fname"
                  label="First Name"
                  placeholder="Enter first name"
                  required
                />
                <TextField
                  control={addForm.control}
                  name="staff_lname"
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                />
              </div>
              <TextField
                control={addForm.control}
                name="staff_email"
                label="Email"
                type="email"
                placeholder="Enter email address"
                required
              />
              <SelectField
                control={addForm.control}
                name="role"
                label="Role"
                placeholder="Select role"
                options={[
                  { value: "librarian", label: "Librarian" },
                  { value: "admin", label: "Administrator" },
                ]}
                required
              />
              <TextField
                control={addForm.control}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter strong password"
                required
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    addForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Staff Member</Button>
              </div>
            </form>
          </Form>
        </Modal>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingStaff(null);
            editForm.reset();
          }}
          size="lg"
          title="Edit Staff Member"
        >
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditStaff)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={editForm.control}
                  name="staff_fname"
                  label="First Name"
                  placeholder="Enter first name"
                  required
                />
                <TextField
                  control={editForm.control}
                  name="staff_lname"
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                />
              </div>
              <TextField
                control={editForm.control}
                name="staff_email"
                label="Email"
                type="email"
                placeholder="Enter email address"
                required
              />
              <SelectField
                control={editForm.control}
                name="role"
                label="Role"
                placeholder="Select role"
                options={[
                  { value: "librarian", label: "Librarian" },
                  { value: "admin", label: "Administrator" },
                ]}
                required
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Staff Member</Button>
              </div>
            </form>
          </Form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              staff member and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStaffToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => staffToDelete && handleDeleteStaff(staffToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
