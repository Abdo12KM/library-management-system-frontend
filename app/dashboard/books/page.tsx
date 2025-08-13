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
import {
  TextField,
  TextareaField,
  SelectField,
} from "@/components/ui/form-fields";
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
import { booksApi, authorsApi, publishersApi } from "@/lib/api";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Book } from "@/types";
import toast from "react-hot-toast";
import {
  bookFormSchema,
  BookFormData,
  defaultBookFormValues,
  transformBookFormData,
} from "@/lib/validations/book";

export default function BooksPage() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authors, setAuthors] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  // React Hook Form setup
  const addForm = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: defaultBookFormValues,
  });

  const editForm = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: defaultBookFormValues,
  });

  useEffect(() => {
    fetchBooks();
    fetchAuthorsAndPublishers();
  }, []);

  useEffect(() => {
    let list = Array.isArray(books) ? books : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((book) => {
        const title = book.book_title?.toLowerCase() || "";
        const authorName =
          typeof book.authorId === "object"
            ? book.authorId.author_name?.toLowerCase()
            : "";
        const publisherName =
          typeof book.publisherId === "object"
            ? book.publisherId.publisher_name?.toLowerCase()
            : "";
        const isbn = book.book_ISBN?.toLowerCase() || "";
        const status = book.book_status?.toLowerCase() || "";

        return (
          title.includes(q) ||
          authorName.includes(q) ||
          publisherName.includes(q) ||
          isbn.includes(q) ||
          status.includes(q)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      list = list.filter((book) => book.book_status === statusFilter);
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.book_title?.toLowerCase() || "";
          bValue = b.book_title?.toLowerCase() || "";
          break;
        case "author":
          aValue =
            typeof a.authorId === "object"
              ? a.authorId.author_name?.toLowerCase()
              : "";
          bValue =
            typeof b.authorId === "object"
              ? b.authorId.author_name?.toLowerCase()
              : "";
          break;
        case "publisher":
          aValue =
            typeof a.publisherId === "object"
              ? a.publisherId.publisher_name?.toLowerCase()
              : "";
          bValue =
            typeof b.publisherId === "object"
              ? b.publisherId.publisher_name?.toLowerCase()
              : "";
          break;
        case "pages":
          aValue = a.book_pages || 0;
          bValue = b.book_pages || 0;
          break;
        case "date":
          aValue = new Date(a.release_date || "");
          bValue = new Date(b.release_date || "");
          break;
        case "status":
          aValue = a.book_status || "";
          bValue = b.book_status || "";
          break;
        default:
          aValue = a.book_title?.toLowerCase() || "";
          bValue = b.book_title?.toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredBooks(list);
  }, [books, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getAll();
      // Normalize various possible response shapes into an array of books
      const raw = (response as any)?.data;
      const arr: Book[] = Array.isArray(raw?.books)
        ? raw.books
        : Array.isArray(raw)
          ? raw
          : Array.isArray((response as any)?.books)
            ? (response as any).books
            : Array.isArray((response as any)?.data?.books)
              ? (response as any).data.books
              : [];
      setBooks(arr);
      setError(null);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Failed to load books");
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorsAndPublishers = async () => {
    try {
      const [authorsResponse, publishersResponse] = await Promise.all([
        authorsApi.getAll(),
        publishersApi.getAll(),
      ]);

      setAuthors(authorsResponse.data?.authors || []);
      setPublishers(publishersResponse.data?.publishers || []);
    } catch (error) {
      console.error("Error fetching authors and publishers:", error);
      toast.error("Failed to fetch authors and publishers");
    }
  };

  const handleAddBook = async (data: BookFormData) => {
    try {
      const bookData = transformBookFormData(data);

      await booksApi.create(bookData);
      toast.success("Book added successfully");
      setShowAddModal(false);
      addForm.reset();
      fetchBooks();
    } catch (error) {
      toast.error("Failed to add book");
      console.error("Error adding book:", error);
    }
  };

  const handleEditBook = async (data: BookFormData) => {
    if (!editingBook) return;

    try {
      const bookData = transformBookFormData(data);

      await booksApi.update(editingBook._id, bookData);
      toast.success("Book updated successfully");
      setShowEditModal(false);
      setEditingBook(null);
      editForm.reset();
      fetchBooks();
    } catch (error) {
      toast.error("Failed to update book");
      console.error("Error updating book:", error);
    }
  };

  const openAddModal = async () => {
    try {
      await fetchAuthorsAndPublishers();
      addForm.reset(defaultBookFormValues);
      setShowAddModal(true);
    } catch (error) {
      console.error("Error preparing add modal:", error);
      setShowAddModal(true); // Still show modal even if fetch fails
    }
  };

  const openEditModal = async (book: Book) => {
    try {
      await fetchAuthorsAndPublishers();

      const formValues = {
        book_title: book.book_title,
        book_description: book.book_description || "",
        book_pages: book.book_pages,
        release_date: book.release_date.split("T")[0], // Format for date input
        book_tags: book.book_tags?.join(", ") || "",
        book_ISBN: book.book_ISBN || "",
        book_status: book.book_status,
        authorId:
          typeof book.authorId === "object" ? book.authorId._id : book.authorId,
        publisherId:
          typeof book.publisherId === "object"
            ? book.publisherId._id
            : book.publisherId,
      };

      editForm.reset(formValues);
      setEditingBook(book);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error preparing edit modal:", error);
      // Still proceed with edit even if fetch fails
      const formValues = {
        book_title: book.book_title,
        book_description: book.book_description || "",
        book_pages: book.book_pages,
        release_date: book.release_date.split("T")[0],
        book_tags: book.book_tags?.join(", ") || "",
        book_ISBN: book.book_ISBN || "",
        book_status: book.book_status,
        authorId:
          typeof book.authorId === "object" ? book.authorId._id : book.authorId,
        publisherId:
          typeof book.publisherId === "object"
            ? book.publisherId._id
            : book.publisherId,
      };

      editForm.reset(formValues);
      setEditingBook(book);
      setShowEditModal(true);
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await booksApi.delete(id);
      toast.success("Book deleted successfully");
      fetchBooks();
      setShowDeleteDialog(false);
      setBookToDelete(null);
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

  const openDeleteDialog = (id: string) => {
    setBookToDelete(id);
    setShowDeleteDialog(true);
  };

  const getBookStats = () => {
    const totalBooks = books.length;
    const availableBooks = books.filter(
      (book) => book.book_status === "available",
    ).length;
    const borrowedBooks = books.filter(
      (book) => book.book_status === "borrowed",
    ).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = books.filter((book) => {
      const createdDate = new Date(book.createdAt || "");
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

    return { totalBooks, availableBooks, borrowedBooks, newThisMonth };
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "borrowed":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Borrowed</Badge>
        );
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800">Maintenance</Badge>;
      case "lost":
        return <Badge className="bg-gray-100 text-gray-800">Lost</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getSortDisplayName = (sortBy: string) => {
    switch (sortBy) {
      case "title":
        return "Title";
      case "author":
        return "Author";
      case "publisher":
        return "Publisher";
      case "pages":
        return "Pages";
      case "date":
        return "Release Date";
      case "status":
        return "Status";
      default:
        return "Title";
    }
  };

  const stats = getBookStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading books...</div>
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
              Books Management
            </h1>
            <p className="text-muted-foreground">
              Manage your library's book collection
            </p>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" />
            <span>Add Book</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <Badge className="bg-primary text-primary-foreground border-0">
                <BookOpen className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalBooks}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisMonth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0">
                <BookOpen className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.availableBooks}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to be borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800 border-0">
                <BookOpen className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.borrowedBooks}
              </div>
              <p className="text-xs text-muted-foreground">Currently on loan</p>
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
                    placeholder="Search books, authors, or publishers..."
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
                      <Filter className="h-4 w-4 mr-2" />
                      Status Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Books
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("available")}
                    >
                      Available
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("borrowed")}
                    >
                      Borrowed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("maintenance")}
                    >
                      Maintenance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("lost")}>
                      Lost
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      Sort: {getSortDisplayName(sortBy)} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("title")}>
                      Title
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("author")}>
                      Author
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("publisher")}>
                      Publisher
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("pages")}>
                      Pages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      Release Date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("status")}>
                      Status
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
                {filteredBooks.length} of {books.length} books
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading books...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Books
              </h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button onClick={fetchBooks}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card
                key={book._id}
                className="hover:shadow-lg group transition-shadow dark:shadow-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-500 line-clamp-2">
                        {book.book_title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        by{" "}
                        {typeof book.authorId === "object"
                          ? book.authorId.author_name
                          : "Unknown Author"}
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
                        <DropdownMenuItem onClick={() => setSelectedBook(book)}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(book)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteDialog(book._id)}
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
                        Publisher
                      </span>
                      <span className="text-sm font-medium">
                        {typeof book.publisherId === "object"
                          ? book.publisherId.publisher_name
                          : "Unknown"}
                      </span>
                    </div>
                    {book.book_ISBN && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          ISBN
                        </span>
                        <span className="text-sm font-mono">
                          {book.book_ISBN}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pages
                      </span>
                      <span className="text-sm">
                        {book.book_pages || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      {getStatusBadge(book.book_status)}
                    </div>
                    {book.release_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Released
                        </span>
                        <span className="text-sm">
                          {new Date(book.release_date).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No books found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? `No books match your search for "${searchTerm}"`
                  : "Get started by adding your first book to the library"}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Book
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedBook && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBook(null)}
          size="lg"
          title={selectedBook.book_title}
        >
          <div>
            {selectedBook.book_description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBook.book_description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span>{selectedBook.book_pages} pages</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(selectedBook.book_status)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Author:</span>
                <span>
                  {typeof selectedBook.authorId === "object"
                    ? selectedBook.authorId.author_name
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Publisher:</span>
                <span>
                  {typeof selectedBook.publisherId === "object"
                    ? selectedBook.publisherId.publisher_name
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Released:</span>
                <span>{new Date(selectedBook.release_date).getFullYear()}</span>
              </div>
              {selectedBook.book_ISBN && (
                <div className="col-span-2 flex items-center space-x-2">
                  <span className="text-muted-foreground">ISBN:</span>
                  <span className="font-mono">{selectedBook.book_ISBN}</span>
                </div>
              )}
              {selectedBook.book_tags && selectedBook.book_tags.length > 0 && (
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedBook.book_tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedBook(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addForm.reset();
          }}
          size="lg"
          title="Add New Book"
        >
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddBook)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <TextField
                    control={addForm.control}
                    name="book_title"
                    label="Title"
                    placeholder="Enter book title"
                    required
                  />
                </div>
                <SelectField
                  control={addForm.control}
                  name="authorId"
                  label="Author"
                  placeholder="Select Author"
                  options={authors.map((author) => ({
                    value: author._id,
                    label: author.author_name,
                  }))}
                  required
                />
                <SelectField
                  control={addForm.control}
                  name="publisherId"
                  label="Publisher"
                  placeholder="Select Publisher"
                  options={publishers.map((publisher) => ({
                    value: publisher._id,
                    label: publisher.publisher_name,
                  }))}
                  required
                />
                <TextField
                  control={addForm.control}
                  name="book_pages"
                  label="Pages"
                  type="number"
                  placeholder="Number of pages"
                  required
                />
                <TextField
                  control={addForm.control}
                  name="release_date"
                  label="Release Date"
                  type="date"
                  required
                />
                <TextField
                  control={addForm.control}
                  name="book_ISBN"
                  label="ISBN"
                  placeholder="Enter ISBN (10 or 13 digits)"
                  required
                />
                <SelectField
                  control={addForm.control}
                  name="book_status"
                  label="Status"
                  placeholder="Select status"
                  options={[
                    { value: "available", label: "Available" },
                    { value: "borrowed", label: "Borrowed" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "lost", label: "Lost" },
                  ]}
                  required
                />
                <div className="col-span-2">
                  <TextField
                    control={addForm.control}
                    name="book_tags"
                    label="Genre/Tags"
                    placeholder="Enter genres separated by commas"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <TextareaField
                    control={addForm.control}
                    name="book_description"
                    label="Description"
                    placeholder="Enter book description (optional)"
                    rows={3}
                  />
                </div>
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
                  {addForm.formState.isSubmitting ? "Adding..." : "Add Book"}
                </Button>
              </div>
            </form>
          </Form>
        </Modal>
      )}

      {/* Edit Book Modal */}
      {showEditModal && editingBook && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBook(null);
            editForm.reset();
          }}
          size="lg"
          title="Edit Book"
        >
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditBook)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <TextField
                    control={editForm.control}
                    name="book_title"
                    label="Title"
                    placeholder="Enter book title"
                    required
                  />
                </div>
                <SelectField
                  control={editForm.control}
                  name="authorId"
                  label="Author"
                  placeholder="Select Author"
                  options={authors.map((author) => ({
                    value: author._id,
                    label: author.author_name,
                  }))}
                  required
                />
                <SelectField
                  control={editForm.control}
                  name="publisherId"
                  label="Publisher"
                  placeholder="Select Publisher"
                  options={publishers.map((publisher) => ({
                    value: publisher._id,
                    label: publisher.publisher_name,
                  }))}
                  required
                />
                <TextField
                  control={editForm.control}
                  name="book_pages"
                  label="Pages"
                  type="number"
                  placeholder="Number of pages"
                  required
                />
                <TextField
                  control={editForm.control}
                  name="release_date"
                  label="Release Date"
                  type="date"
                  required
                />
                <TextField
                  control={editForm.control}
                  name="book_ISBN"
                  label="ISBN"
                  placeholder="Enter ISBN (10 or 13 digits)"
                  required
                />
                <SelectField
                  control={editForm.control}
                  name="book_status"
                  label="Status"
                  placeholder="Select status"
                  options={[
                    { value: "available", label: "Available" },
                    { value: "borrowed", label: "Borrowed" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "lost", label: "Lost" },
                  ]}
                  required
                />
                <div className="col-span-2">
                  <TextField
                    control={editForm.control}
                    name="book_tags"
                    label="Genre/Tags"
                    placeholder="Enter genres separated by commas"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <TextareaField
                    control={editForm.control}
                    name="book_description"
                    label="Description"
                    placeholder="Enter book description (optional)"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBook(null);
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
                    : "Update Book"}
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
              book from the library system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookToDelete && handleDeleteBook(bookToDelete)}
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
