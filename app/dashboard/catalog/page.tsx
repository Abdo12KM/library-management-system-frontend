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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { booksApi } from "@/lib/api";
import { Search, BookOpen, Eye, Filter, SortAsc, SortDesc } from "lucide-react";
import type { Book } from "@/types";
import toast from "react-hot-toast";

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchBooks();
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
        const tags = book.book_tags?.join(" ").toLowerCase() || "";
        const description = book.book_description?.toLowerCase() || "";
        return (
          title.includes(q) ||
          authorName.includes(q) ||
          publisherName.includes(q) ||
          isbn.includes(q) ||
          status.includes(q) ||
          tags.includes(q) ||
          description.includes(q)
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
      setError("Failed to load books");
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading catalog...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Book Catalog</h1>
            <p className="text-muted-foreground">
              Browse and discover books in our library collection. Visit the
              library to borrow any book.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search books, authors, publishers, or tags..."
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <Card
              key={book._id}
              className="hover:shadow-lg transition-shadow group flex flex-col dark:shadow-gray-700"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {book.book_title}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  by{" "}
                  {typeof book.authorId === "object"
                    ? book.authorId.author_name
                    : "Unknown Author"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {book.book_pages && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pages</span>
                    <span>{book.book_pages}</span>
                  </div>
                )}

                {book.book_ISBN && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ISBN</span>
                    <span className="font-mono text-xs">{book.book_ISBN}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(book.book_status)}
                </div>

                {book.release_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Published</span>
                    <span>{new Date(book.release_date).getFullYear()}</span>
                  </div>
                )}

                {book.book_tags && book.book_tags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {book.book_tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {book.book_tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{book.book_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="mt-auto px-6 pb-6">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedBook(book)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

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
                  : "No books are currently available in the catalog"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Details Modal */}
        {selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedBook.book_title}
                    </CardTitle>
                    <div className="text-lg mt-1 text-muted-foreground">
                      by{" "}
                      {typeof selectedBook.authorId === "object"
                        ? selectedBook.authorId.author_name
                        : "Unknown Author"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBook(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <span>
                      {new Date(selectedBook.release_date).getFullYear()}
                    </span>
                  </div>
                  {selectedBook.book_ISBN && (
                    <div className="col-span-2 flex items-center space-x-2">
                      <span className="text-muted-foreground">ISBN:</span>
                      <span className="font-mono">
                        {selectedBook.book_ISBN}
                      </span>
                    </div>
                  )}
                  {selectedBook.book_tags &&
                    selectedBook.book_tags.length > 0 && (
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedBook.book_tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
