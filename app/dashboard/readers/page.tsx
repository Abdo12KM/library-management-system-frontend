"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/store";
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
import { readersApi } from "@/lib/api";
import {
  Plus,
  Search,
  Users,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Trash2,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Reader } from "@/types";
import toast from "react-hot-toast";

export default function ReadersPage() {
  const { user } = useAuthStore();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReaders, setFilteredReaders] = useState<Reader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [readerToDelete, setReaderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchReaders();
  }, []);

  useEffect(() => {
    let list = Array.isArray(readers) ? readers : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((reader) => {
        const fname = reader.reader_fname?.toLowerCase() || "";
        const lname = reader.reader_lname?.toLowerCase() || "";
        const email = reader.reader_email?.toLowerCase() || "";
        const phone = reader.reader_phone_no?.toLowerCase() || "";
        const address = reader.reader_address?.toLowerCase() || "";

        return (
          fname.includes(q) ||
          lname.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          address.includes(q)
        );
      });
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = (a.reader_fname + " " + a.reader_lname)?.toLowerCase() || "";
          bValue = (b.reader_fname + " " + b.reader_lname)?.toLowerCase() || "";
          break;
        case "email":
          aValue = a.reader_email?.toLowerCase() || "";
          bValue = b.reader_email?.toLowerCase() || "";
          break;
        case "phone":
          aValue = a.reader_phone_no?.toLowerCase() || "";
          bValue = b.reader_phone_no?.toLowerCase() || "";
          break;
        case "date":
          aValue = new Date(a.createdAt || "");
          bValue = new Date(b.createdAt || "");
          break;
        default:
          aValue = (a.reader_fname + " " + a.reader_lname)?.toLowerCase() || "";
          bValue = (b.reader_fname + " " + b.reader_lname)?.toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredReaders(list);
  }, [readers, searchTerm, sortBy, sortOrder]);

  const fetchReaders = async () => {
    try {
      setLoading(true);
      const response = await readersApi.getAll();
      setReaders(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching readers:", error);
      setError("Failed to load readers");
      toast.error("Failed to fetch readers");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReader = async (id: string) => {
    try {
      await readersApi.delete(id);
      toast.success("Reader deleted successfully");
      fetchReaders();
      setShowDeleteDialog(false);
      setReaderToDelete(null);
    } catch (error) {
      toast.error("Failed to delete reader");
    }
  };

  const openDeleteDialog = (id: string) => {
    setReaderToDelete(id);
    setShowDeleteDialog(true);
  };

  const getReaderStats = () => {
    const totalReaders = readers.length;
    const activeReaders = readers.length; // All readers are considered active
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = readers.filter((reader) => {
      const createdDate = new Date(reader.createdAt || "");
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

    return { totalReaders, activeReaders, newThisMonth };
  };

  const getSortDisplayName = (sortBy: string) => {
    switch (sortBy) {
      case "name":
        return "Name";
      case "email":
        return "Email";
      case "phone":
        return "Phone";
      case "date":
        return "Join Date";
      default:
        return "Name";
    }
  };

  const stats = getReaderStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading readers...</div>
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
              Readers Management
            </h1>
            <p className="text-muted-foreground">
              View and manage library reader accounts
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Readers can register through the authentication system
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Readers
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground border-0">
                <Users className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalReaders}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisMonth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Readers
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0">
                <UserCheck className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activeReaders}
              </div>
              <p className="text-xs text-muted-foreground">
                Current registered readers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New This Month
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                <Plus className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.newThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">
                Recently registered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search readers..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      Sort: {getSortDisplayName(sortBy)} (
                      {sortOrder === "asc" ? "A-Z" : "Z-A"})
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
                    <DropdownMenuItem onClick={() => setSortBy("phone")}>
                      Phone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      Date Added
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? "Descending" : "Ascending"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredReaders.length} of {readers.length} readers
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Readers Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading readers...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Readers
              </h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button onClick={fetchReaders}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReaders.map((reader) => (
              <Card
                key={reader._id}
                className="hover:shadow-lg group transition-shadow dark:shadow-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-500 line-clamp-2">
                        {reader.reader_fname} {reader.reader_lname}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {reader.reader_email}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedReader(reader)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteDialog(reader._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reader.reader_phone_no && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {reader.reader_phone_no}
                        </span>
                      </div>
                    )}
                    {reader.reader_address && (
                      <div className="flex items-start">
                        <MapPin className="h-3 w-3 mr-2 text-gray-400 mt-0.5" />
                        <span className="text-sm line-clamp-2">
                          {reader.reader_address}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Joined
                      </span>
                      <span className="text-sm">
                        {new Date(reader.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredReaders.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No readers found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? `No readers match your search for "${searchTerm}"`
                  : "No readers have registered yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedReader && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReader(null)}
          size="lg"
          title={`${selectedReader.reader_fname} ${selectedReader.reader_lname}`}
        >
          <div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Email:</span>
                <span>{selectedReader.reader_email}</span>
              </div>
              {selectedReader.reader_phone_no && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{selectedReader.reader_phone_no}</span>
                </div>
              )}
              {selectedReader.reader_address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-muted-foreground">Address:</span>
                  <span>{selectedReader.reader_address}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Member since:</span>
                <span>
                  {new Date(selectedReader.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedReader(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              reader account from the library system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                readerToDelete && handleDeleteReader(readerToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
