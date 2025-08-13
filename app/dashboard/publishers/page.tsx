"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
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
import { publishersApi } from "@/lib/api";
import {
  Plus,
  Search,
  Building,
  Edit,
  Trash2,
  SortAsc,
  MoreHorizontal,
  Globe,
  BookOpen,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Publisher } from "@/types";
import toast from "react-hot-toast";
import {
  publisherFormSchema,
  PublisherFormData,
  defaultPublisherFormValues,
  transformPublisherFormData,
} from "@/lib/validations/publisher";

export default function PublishersPage() {
  const { user } = useAuthStore();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [publisherToDelete, setPublisherToDelete] = useState<string | null>(
    null,
  );

  // React Hook Form setup
  const addForm = useForm<PublisherFormData>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: defaultPublisherFormValues,
  });

  const editForm = useForm<PublisherFormData>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: defaultPublisherFormValues,
  });

  useEffect(() => {
    fetchPublishers();
  }, []);

  useEffect(() => {
    let list = Array.isArray(publishers) ? publishers : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((publisher) => {
        const name = publisher.publisher_name?.toLowerCase() || "";
        const website = publisher.publisher_website?.toLowerCase() || "";

        return name.includes(q) || website.includes(q);
      });
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.publisher_name?.toLowerCase() || "";
          bValue = b.publisher_name?.toLowerCase() || "";
          break;
        case "books":
          aValue = a.no_published_books || 0;
          bValue = b.no_published_books || 0;
          break;
        case "year":
          aValue = a.year_of_publication || 0;
          bValue = b.year_of_publication || 0;
          break;
        case "date":
          aValue = new Date(a.createdAt || "");
          bValue = new Date(b.createdAt || "");
          break;
        default:
          aValue = a.publisher_name?.toLowerCase() || "";
          bValue = b.publisher_name?.toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredPublishers(list);
  }, [publishers, searchTerm, sortBy, sortOrder]);

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const response = await publishersApi.getAll();
      // Normalize various possible response shapes into an array of publishers
      const raw = (response as any)?.data;
      const arr: Publisher[] = Array.isArray(raw?.publishers)
        ? raw.publishers
        : Array.isArray(raw)
          ? raw
          : Array.isArray((response as any)?.publishers)
            ? (response as any).publishers
            : Array.isArray((response as any)?.data?.publishers)
              ? (response as any).data.publishers
              : [];
      setPublishers(arr);
      setError(null);
    } catch (error) {
      console.error("Error fetching publishers:", error);
      setError("Failed to load publishers");
      toast.error("Failed to fetch publishers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPublisher = async (data: PublisherFormData) => {
    try {
      const publisherData = transformPublisherFormData(data);

      await publishersApi.create(publisherData);
      toast.success("Publisher added successfully");
      setShowAddModal(false);
      addForm.reset();
      fetchPublishers();
    } catch (error) {
      toast.error("Failed to add publisher");
      console.error("Error adding publisher:", error);
    }
  };

  const handleEditPublisher = async (data: PublisherFormData) => {
    if (!editingPublisher) return;

    try {
      const publisherData = transformPublisherFormData(data);

      await publishersApi.update(editingPublisher._id, publisherData);
      toast.success("Publisher updated successfully");
      setShowEditModal(false);
      setEditingPublisher(null);
      editForm.reset();
      fetchPublishers();
    } catch (error) {
      toast.error("Failed to update publisher");
      console.error("Error updating publisher:", error);
    }
  };

  const openAddModal = () => {
    addForm.reset(defaultPublisherFormValues);
    setShowAddModal(true);
  };

  const openEditModal = (publisher: Publisher) => {
    const formValues = {
      publisher_name: publisher.publisher_name,
      publisher_website: publisher.publisher_website || "",
      year_of_publication:
        publisher.year_of_publication || new Date().getFullYear(),
      no_published_books: publisher.no_published_books || 0,
    };

    editForm.reset(formValues);
    setEditingPublisher(publisher);
    setShowEditModal(true);
  };

  const handleDeletePublisher = async (id: string) => {
    try {
      await publishersApi.delete(id);
      toast.success("Publisher deleted successfully");
      fetchPublishers();
      setShowDeleteDialog(false);
      setPublisherToDelete(null);
    } catch (error) {
      toast.error("Failed to delete publisher");
    }
  };

  const openDeleteDialog = (id: string) => {
    setPublisherToDelete(id);
    setShowDeleteDialog(true);
  };

  const getPublisherStats = () => {
    const totalPublishers = publishers.length;
    const activePublishers = publishers.filter(
      (pub) => pub.no_published_books > 0,
    ).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = publishers.filter((publisher) => {
      const createdDate = new Date(publisher.createdAt || "");
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

    return { totalPublishers, activePublishers, newThisMonth };
  };

  const stats = getPublisherStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading publishers...</div>
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
              Publishers Management
            </h1>
            <p className="text-muted-foreground">
              Manage your library's publisher collection
            </p>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" />
            <span>Add Publisher</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Publishers
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground border-0">
                <Building className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalPublishers}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisMonth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Publishers
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0">
                <BookOpen className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activePublishers}
              </div>
              <p className="text-xs text-muted-foreground">
                With published books
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
              <p className="text-xs text-muted-foreground">Recently added</p>
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
                    placeholder="Search publishers..."
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
                    <DropdownMenuItem onClick={() => setSortBy("books")}>
                      Published Books
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("year")}>
                      Year of Publication
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
                {filteredPublishers.length} of {publishers.length} publishers
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Publishers Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading publishers...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Publishers
              </h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button onClick={fetchPublishers}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPublishers.map((publisher) => (
              <Card
                key={publisher._id}
                className="hover:shadow-lg group transition-shadow dark:shadow-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-500 line-clamp-2">
                        {publisher.publisher_name}
                      </CardTitle>
                      {publisher.publisher_website && (
                        <CardDescription className="mt-1 flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          {publisher.publisher_website}
                        </CardDescription>
                      )}
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
                          onClick={() => setSelectedPublisher(publisher)}
                        >
                          <Building className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditModal(publisher)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteDialog(publisher._id)}
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Published Books
                      </span>
                      <span className="text-sm font-medium">
                        {publisher.no_published_books || 0}
                      </span>
                    </div>
                    {publisher.year_of_publication && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Year of Publication
                        </span>
                        <span className="text-sm">
                          {publisher.year_of_publication}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Added
                      </span>
                      <span className="text-sm">
                        {new Date(publisher.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPublishers.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No publishers found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? `No publishers match your search for "${searchTerm}"`
                  : "Get started by adding your first publisher to the library"}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Publisher
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedPublisher && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPublisher(null)}
          size="lg"
          title={selectedPublisher.publisher_name}
        >
          <div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              {selectedPublisher.publisher_website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Website:</span>
                  <a
                    href={selectedPublisher.publisher_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {selectedPublisher.publisher_website}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Published Books:</span>
                <span>{selectedPublisher.no_published_books || 0}</span>
              </div>
              {selectedPublisher.year_of_publication && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">
                    Year of Publication:
                  </span>
                  <span>{selectedPublisher.year_of_publication}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Added:</span>
                <span>
                  {new Date(selectedPublisher.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedPublisher(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Publisher Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addForm.reset();
          }}
          size="lg"
          title="Add New Publisher"
        >
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddPublisher)}
              className="space-y-4"
            >
              <TextField
                control={addForm.control}
                name="publisher_name"
                label="Publisher Name"
                placeholder="Enter publisher name"
                required
              />
              <TextField
                control={addForm.control}
                name="publisher_website"
                label="Website"
                type="text"
                placeholder="Enter website URL (optional)"
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={addForm.control}
                  name="year_of_publication"
                  label="Year of Publication"
                  type="number"
                  placeholder="Enter year"
                />
                <TextField
                  control={addForm.control}
                  name="no_published_books"
                  label="Number of Published Books"
                  type="number"
                  placeholder="Enter number of books"
                />
              </div>
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
                <Button type="submit" disabled={addForm.formState.isSubmitting}>
                  {addForm.formState.isSubmitting
                    ? "Adding..."
                    : "Add Publisher"}
                </Button>
              </div>
            </form>
          </Form>
        </Modal>
      )}

      {/* Edit Publisher Modal */}
      {showEditModal && editingPublisher && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPublisher(null);
            editForm.reset();
          }}
          size="lg"
          title="Edit Publisher"
        >
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditPublisher)}
              className="space-y-4"
            >
              <TextField
                control={editForm.control}
                name="publisher_name"
                label="Publisher Name"
                placeholder="Enter publisher name"
                required
              />
              <TextField
                control={editForm.control}
                name="publisher_website"
                label="Website"
                type="text"
                placeholder="Enter website URL (optional)"
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={editForm.control}
                  name="year_of_publication"
                  label="Year of Publication"
                  type="number"
                  placeholder="Enter year"
                />
                <TextField
                  control={editForm.control}
                  name="no_published_books"
                  label="Number of Published Books"
                  type="number"
                  placeholder="Enter number of books"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPublisher(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                >
                  {editForm.formState.isSubmitting
                    ? "Updating..."
                    : "Update Publisher"}
                </Button>
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
              publisher from the library system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                publisherToDelete && handleDeletePublisher(publisherToDelete)
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
