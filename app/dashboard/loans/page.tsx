"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Form } from "@/components/ui/form";
import { SelectField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { loansApi, booksApi, readersApi } from "@/lib/api";
import {
  Search,
  Plus,
  Trash2,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  User,
  Calendar,
  SortAsc,
  SortDesc,
  Filter,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { Loan, Book, Reader } from "@/types";
import {
  loanFormSchema,
  LoanFormData,
  defaultLoanFormValues,
  transformLoanFormData,
} from "@/lib/validations/loan";

export default function LoansPage() {
  const { user } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);

  // React Hook Form setup
  const addForm = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: defaultLoanFormValues,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let list = Array.isArray(loans) ? loans : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((loan) => {
        const bookTitle =
          typeof loan.bookId === "object"
            ? loan.bookId.book_title?.toLowerCase() || ""
            : "";
        const readerName =
          typeof loan.readerId === "object"
            ? `${loan.readerId.reader_fname} ${loan.readerId.reader_lname}`.toLowerCase()
            : "";

        return (
          loan._id.toLowerCase().includes(q) ||
          loan.status.toLowerCase().includes(q) ||
          bookTitle.includes(q) ||
          readerName.includes(q)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      list = list.filter((loan) => loan.status === statusFilter);
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "book":
          aValue =
            typeof a.bookId === "object"
              ? a.bookId.book_title?.toLowerCase() || ""
              : "";
          bValue =
            typeof b.bookId === "object"
              ? b.bookId.book_title?.toLowerCase() || ""
              : "";
          break;
        case "reader":
          const aReader =
            typeof a.readerId === "object"
              ? `${a.readerId.reader_fname} ${a.readerId.reader_lname}`.toLowerCase()
              : "";
          const bReader =
            typeof b.readerId === "object"
              ? `${b.readerId.reader_fname} ${b.readerId.reader_lname}`.toLowerCase()
              : "";
          aValue = aReader;
          bValue = bReader;
          break;
        case "status":
          aValue = a.status?.toLowerCase() || "";
          bValue = b.status?.toLowerCase() || "";
          break;
        case "dueDate":
          aValue = new Date(a.loan_due_date || "");
          bValue = new Date(b.loan_due_date || "");
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

    setFilteredLoans(list);
  }, [loans, searchTerm, sortBy, sortOrder, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansResponse, booksResponse, readersResponse] = await Promise.all(
        [loansApi.getAll(), booksApi.getAll(), readersApi.getAll()],
      );

      setLoans(loansResponse.data.loans);
      setBooks(booksResponse.data.books);
      setReaders(readersResponse.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load loans");
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = async (data: LoanFormData) => {
    try {
      const loanData = transformLoanFormData(data);
      await loansApi.create(loanData);
      toast.success("Loan created successfully");
      setShowAddModal(false);
      addForm.reset();
      fetchData();
    } catch (error) {
      toast.error("Failed to create loan");
      console.error("Error creating loan:", error);
    }
  };

  const handleEditLoan = async (data: LoanFormData) => {
    // Note: API doesn't support loan updates
    toast.error("Loan editing is not supported by the API");
  };

  const handleReturnLoan = async (loanId: string) => {
    try {
      await loansApi.return(loanId);
      toast.success("Book returned successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to return book");
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    // Note: API doesn't support loan renewal
    toast.error("Loan renewal is not supported by the API");
  };

  const openAddModal = () => {
    addForm.reset(defaultLoanFormValues);
    setShowAddModal(true);
  };

  const openEditModal = (loan: Loan) => {
    toast.error("Loan editing is not supported by the API");
  };

  const handleDeleteLoan = async (id: string) => {
    // Note: API doesn't support loan deletion
    toast.error("Loan deletion is not supported by the API");
    setShowDeleteDialog(false);
    setLoanToDelete(null);
  };

  const openDeleteDialog = (id: string) => {
    setLoanToDelete(id);
    setShowDeleteDialog(true);
  };

  const getLoanStats = () => {
    const activeLoans = loans.filter((loan) => loan.status === "active").length;

    const today = new Date();
    const dueToday = loans.filter((loan) => {
      if (loan.status !== "active") return false;
      const dueDate = new Date(loan.loan_due_date);
      return dueDate.toDateString() === today.toDateString();
    }).length;

    const overdueLoans = loans.filter(
      (loan) => loan.status === "overdue",
    ).length;

    const returnedToday = loans.filter((loan) => {
      if (loan.status !== "returned" || !loan.loan_return_date) return false;
      const returnDate = new Date(loan.loan_return_date);
      return returnDate.toDateString() === today.toDateString();
    }).length;

    return { activeLoans, dueToday, overdueLoans, returnedToday };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "returned":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "extended":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const isOverdue = (loan: Loan) => {
    if (loan.status !== "active") return false;
    const dueDate = new Date(loan.loan_due_date);
    const today = new Date();
    return dueDate < today;
  };

  const getDaysOverdue = (loan: Loan) => {
    const dueDate = new Date(loan.loan_due_date);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSortDisplayName = (sortBy: string) => {
    switch (sortBy) {
      case "book":
        return "Book";
      case "reader":
        return "Reader";
      case "status":
        return "Status";
      case "date":
        return "Date";
      default:
        return "Date";
    }
  };

  const stats = getLoanStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading loans...</div>
        </div>
      </DashboardLayout>
    );
  }

  const bookOptions = books
    .filter((book) => book.book_status === "available")
    .map((book) => {
      const authorName =
        typeof book.authorId === "object"
          ? book.authorId.author_name
          : "Unknown Author";
      return {
        value: book._id,
        label: `${book.book_title} by ${authorName}`,
      };
    });

  const readerOptions = readers.map((reader) => ({
    value: reader._id,
    label: `${reader.reader_fname} ${reader.reader_lname} (${reader.reader_email})`,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Loan Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage book loans and returns
            </p>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" />
            <span>Create Loan</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Loans
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                <FileText className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activeLoans}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800 border-0">
                <Clock className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.dueToday}
              </div>
              <p className="text-xs text-muted-foreground">Books due today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Badge className="bg-red-100 text-red-800 border-0">
                <AlertTriangle className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.overdueLoans}
              </div>
              <p className="text-xs text-muted-foreground">Overdue loans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Returned Today
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0">
                <CheckCircle className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.returnedToday}
              </div>
              <p className="text-xs text-muted-foreground">Books returned</p>
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
                    placeholder="Search loans..."
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
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("overdue")}
                    >
                      Overdue
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("returned")}
                    >
                      Returned
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("extended")}
                    >
                      Extended
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
                      Sort: {getSortDisplayName(sortBy)} (
                      {sortOrder === "asc" ? "A-Z" : "Z-A"})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      Date Created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("dueDate")}>
                      Due Date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("book")}>
                      Book Title
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("reader")}>
                      Reader Name
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
                {filteredLoans.length} of {loans.length} loans
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Loans Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading loans...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Loans
              </h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button onClick={fetchData}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLoans.map((loan) => {
              const bookTitle =
                typeof loan.bookId === "object"
                  ? loan.bookId.book_title
                  : "Unknown Book";
              const readerName =
                typeof loan.readerId === "object"
                  ? `${loan.readerId.reader_fname} ${loan.readerId.reader_lname}`
                  : "Unknown Reader";
              const overdue = isOverdue(loan);

              return (
                <Card
                  key={loan._id}
                  className={`hover:shadow-lg group transition-shadow dark:shadow-gray-700 ${
                    overdue ? "border-red-200 dark:border-red-800" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-500 line-clamp-2">
                          {bookTitle}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {readerName}
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
                            onClick={() => setSelectedLoan(loan)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {loan.status === "active" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleReturnLoan(loan._id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Returned
                              </DropdownMenuItem>
                            </>
                          )}
                          {user?.role === "admin" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openDeleteDialog(loan._id)}
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
                          Status
                        </span>
                        <Badge
                          className={`text-xs capitalize ${getStatusColor(loan.status)}`}
                        >
                          {loan.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Start Date
                        </span>
                        <span className="text-sm">
                          {new Date(loan.loan_start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Due Date
                        </span>
                        <span
                          className={`text-sm ${overdue ? "text-red-600 font-medium" : ""}`}
                        >
                          {new Date(loan.loan_due_date).toLocaleDateString()}
                          {overdue && (
                            <span className="ml-1">
                              ({getDaysOverdue(loan)} days overdue)
                            </span>
                          )}
                        </span>
                      </div>
                      {loan.loan_return_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Returned
                          </span>
                          <span className="text-sm">
                            {new Date(
                              loan.loan_return_date,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredLoans.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No loans found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? `No loans match your search for "${searchTerm}"`
                  : "No loans have been created yet"}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Loan
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedLoan && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLoan(null)}
          size="lg"
          title="Loan Details"
        >
          <div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Book:</span>
                <span>
                  {typeof selectedLoan.bookId === "object"
                    ? selectedLoan.bookId.book_title
                    : "Unknown Book"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Reader:</span>
                <span>
                  {typeof selectedLoan.readerId === "object"
                    ? `${selectedLoan.readerId.reader_fname} ${selectedLoan.readerId.reader_lname}`
                    : "Unknown Reader"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(selectedLoan.status)}>
                  {selectedLoan.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Start Date:</span>
                <span>
                  {new Date(selectedLoan.loan_start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Due Date:</span>
                <span>
                  {new Date(selectedLoan.loan_due_date).toLocaleDateString()}
                </span>
              </div>
              {selectedLoan.loan_return_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Return Date:</span>
                  <span>
                    {new Date(
                      selectedLoan.loan_return_date,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {new Date(selectedLoan.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedLoan(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Loan Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addForm.reset();
          }}
          size="lg"
          title="Create New Loan"
        >
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddLoan)}
              className="space-y-4"
            >
              <SelectField
                control={addForm.control}
                name="bookId"
                label="Book"
                placeholder="Select a book"
                options={bookOptions}
                required
              />
              <SelectField
                control={addForm.control}
                name="readerId"
                label="Reader"
                placeholder="Select a reader"
                options={readerOptions}
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
                <Button type="submit" disabled={addForm.formState.isSubmitting}>
                  {addForm.formState.isSubmitting
                    ? "Creating..."
                    : "Create Loan"}
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
              loan record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => loanToDelete && handleDeleteLoan(loanToDelete)}
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
