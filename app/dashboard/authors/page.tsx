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
import { TextField, TextareaField } from "@/components/ui/form-fields";
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
import { authorsApi } from "@/lib/api";
import {
  Plus,
  Search,
  User,
  Edit,
  Trash2,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Mail,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Author } from "@/types";
import toast from "react-hot-toast";
import {
  authorFormSchema,
  AuthorFormData,
  defaultAuthorFormValues,
  transformAuthorFormData,
} from "@/lib/validations/author";

export default function AuthorsPage() {
  const { user } = useAuthStore();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<string | null>(null);

  // React Hook Form setup
  const addForm = useForm<AuthorFormData>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: defaultAuthorFormValues,
  });

  const editForm = useForm<AuthorFormData>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: defaultAuthorFormValues,
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    let list = Array.isArray(authors) ? authors : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((author) => {
        const name = author.author_name?.toLowerCase() || "";
        const email = author.email?.toLowerCase() || "";
        const biography = author.biography?.toLowerCase() || "";

        return name.includes(q) || email.includes(q) || biography.includes(q);
      });
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.author_name?.toLowerCase() || "";
          bValue = b.author_name?.toLowerCase() || "";
          break;
        case "email":
          aValue = a.email?.toLowerCase() || "";
          bValue = b.email?.toLowerCase() || "";
          break;
        case "date":
          aValue = new Date(a.createdAt || "");
          bValue = new Date(b.createdAt || "");
          break;
        default:
          aValue = a.author_name?.toLowerCase() || "";
          bValue = b.author_name?.toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredAuthors(list);
  }, [authors, searchTerm, sortBy, sortOrder]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await authorsApi.getAll();
      console.log("Fetched authors:", response);
      // Normalize various possible response shapes into an array of authors
      const raw = (response as any)?.data;
      const arr: Author[] = Array.isArray(raw?.authors)
        ? raw.authors
        : Array.isArray(raw)
          ? raw
          : Array.isArray((response as any)?.authors)
            ? (response as any).authors
            : Array.isArray((response as any)?.data?.authors)
              ? (response as any).data.authors
              : [];
      setAuthors(arr);
      setError(null);
    } catch (error) {
      console.error("Error fetching authors:", error);
      setError("Failed to load authors");
      toast.error("Failed to fetch authors");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = async (data: AuthorFormData) => {
    try {
      const authorData = transformAuthorFormData(data);

      await authorsApi.create(authorData);
      toast.success("Author added successfully");
      setShowAddModal(false);
      addForm.reset();
      fetchAuthors();
    } catch (error) {
      toast.error("Failed to add author");
      console.error("Error adding author:", error);
    }
  };

  const handleEditAuthor = async (data: AuthorFormData) => {
    if (!editingAuthor) return;

    try {
      const authorData = transformAuthorFormData(data);

      await authorsApi.update(editingAuthor._id, authorData);
      toast.success("Author updated successfully");
      setShowEditModal(false);
      setEditingAuthor(null);
      editForm.reset();
      fetchAuthors();
    } catch (error) {
      toast.error("Failed to update author");
      console.error("Error updating author:", error);
    }
  };

  const openAddModal = () => {
    addForm.reset(defaultAuthorFormValues);
    setShowAddModal(true);
  };

  const openEditModal = (author: Author) => {
    const formValues = {
      author_name: author.author_name,
      email: author.email,
      biography: author.biography || "",
    };

    editForm.reset(formValues);
    setEditingAuthor(author);
    setShowEditModal(true);
  };

  const handleDeleteAuthor = async (id: string) => {
    try {
      await authorsApi.delete(id);
      toast.success("Author deleted successfully");
      fetchAuthors();
      setShowDeleteDialog(false);
      setAuthorToDelete(null);
    } catch (error) {
      toast.error("Failed to delete author");
    }
  };

  const openDeleteDialog = (id: string) => {
    setAuthorToDelete(id);
    setShowDeleteDialog(true);
  };

  const getAuthorStats = () => {
    const totalAuthors = authors.length;
    // For now, assume all authors are active since we don't have book count in the response
    const activeAuthors = authors.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = authors.filter((author) => {
      const createdDate = new Date(author.createdAt || "");
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

    return { totalAuthors, activeAuthors, newThisMonth };
  };

  const getSortDisplayName = (sortBy: string) => {
    switch (sortBy) {
      case "name":
        return "Name";
      case "email":
        return "Email";
      case "date":
        return "Join Date";
      default:
        return "Name";
    }
  };

  const stats = getAuthorStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading authors...</div>
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
              Authors Management
            </h1>
            <p className="text-muted-foreground">
              Manage your library's author collection
            </p>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" />
            <span>Add Author</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Authors
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground border-0">
                <User className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalAuthors}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisMonth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Authors
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0">
                <User className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activeAuthors}
              </div>
              <p className="text-xs text-muted-foreground">
                Contributing to library
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
                    placeholder="Search authors..."
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
                {filteredAuthors.length} of {authors.length} authors
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Authors Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading authors...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Authors
              </h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button onClick={fetchAuthors}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuthors.map((author) => (
              <Card
                key={author._id}
                className="hover:shadow-lg group transition-shadow dark:shadow-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-500 line-clamp-2">
                        {author.author_name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {author.email}
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
                          onClick={() => setSelectedAuthor(author)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(author)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteDialog(author._id)}
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
                    {author.biography && (
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {author.biography}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Added
                      </span>
                      <span className="text-sm">
                        {new Date(author.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredAuthors.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No authors found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? `No authors match your search for "${searchTerm}"`
                  : "Get started by adding your first author to the library"}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Author
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedAuthor && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAuthor(null)}
          size="lg"
          title={selectedAuthor.author_name}
        >
          <div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Email:</span>
                <span>{selectedAuthor.email}</span>
              </div>
              {selectedAuthor.biography && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Biography
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAuthor.biography}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Added:</span>
                <span>
                  {new Date(selectedAuthor.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedAuthor(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Author Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addForm.reset();
          }}
          size="lg"
          title="Add New Author"
        >
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddAuthor)}
              className="space-y-4"
            >
              <TextField
                control={addForm.control}
                name="author_name"
                label="Author Name"
                placeholder="Enter author name"
                required
              />
              <TextField
                control={addForm.control}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email address"
                required
              />
              <TextareaField
                control={addForm.control}
                name="biography"
                label="Biography"
                placeholder="Enter author biography (optional)"
                rows={4}
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
                <Button type="submit" disabled={addForm.formState.isSubmitting}>
                  {addForm.formState.isSubmitting ? "Adding..." : "Add Author"}
                </Button>
              </div>
            </form>
          </Form>
        </Modal>
      )}

      {/* Edit Author Modal */}
      {showEditModal && editingAuthor && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingAuthor(null);
            editForm.reset();
          }}
          size="lg"
          title="Edit Author"
        >
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditAuthor)}
              className="space-y-4"
            >
              <TextField
                control={editForm.control}
                name="author_name"
                label="Author Name"
                placeholder="Enter author name"
                required
              />
              <TextField
                control={editForm.control}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email address"
                required
              />
              <TextareaField
                control={editForm.control}
                name="biography"
                label="Biography"
                placeholder="Enter author biography (optional)"
                rows={4}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAuthor(null);
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
                    : "Update Author"}
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
              author from the library system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                authorToDelete && handleDeleteAuthor(authorToDelete)
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
