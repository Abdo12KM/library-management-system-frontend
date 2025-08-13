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
import { Form } from "@/components/ui/form";
import {
  TextField,
  SelectField,
  ComboboxField,
} from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { finesApi, loansApi } from "@/lib/api";
import {
  Search,
  Plus,
  MoreHorizontal,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  SortAsc,
  SortDesc,
  CreditCard,
  BookOpen,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { Fine, Loan } from "@/types";
import {
  fineFormSchema,
  FineFormData,
  defaultFineFormValues,
  transformFineFormData,
} from "@/lib/validations/fine";

export default function FinesPage() {
  const { user } = useAuthStore();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFines, setFilteredFines] = useState<Fine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [amountFilter, setAmountFilter] = useState<string>("all");

  // React Hook Form setup
  const addForm = useForm<FineFormData>({
    resolver: zodResolver(fineFormSchema),
    defaultValues: defaultFineFormValues,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let list = Array.isArray(fines) ? fines : [];

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((fine) => {
        const loanData = typeof fine.loanId === "object" ? fine.loanId : null;
        const bookTitle =
          loanData && typeof loanData.bookId === "object"
            ? loanData.bookId.book_title?.toLowerCase() || ""
            : "";
        const readerName =
          loanData && typeof loanData.readerId === "object"
            ? `${loanData.readerId.reader_fname} ${loanData.readerId.reader_lname}`.toLowerCase()
            : "";

        return (
          fine._id.toLowerCase().includes(q) ||
          fine.status.toLowerCase().includes(q) ||
          bookTitle.includes(q) ||
          readerName.includes(q) ||
          fine.accumulated_amount.toString().includes(q)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      list = list.filter((fine) => fine.status === statusFilter);
    }

    // Apply amount filter
    if (amountFilter !== "all") {
      switch (amountFilter) {
        case "under10":
          list = list.filter((fine) => fine.accumulated_amount < 10);
          break;
        case "10to50":
          list = list.filter(
            (fine) =>
              fine.accumulated_amount >= 10 && fine.accumulated_amount <= 50,
          );
          break;
        case "over50":
          list = list.filter((fine) => fine.accumulated_amount > 50);
          break;
      }
    }

    // Apply sorting
    list.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "amount":
          aValue = a.accumulated_amount;
          bValue = b.accumulated_amount;
          break;
        case "status":
          aValue = a.status?.toLowerCase() || "";
          bValue = b.status?.toLowerCase() || "";
          break;
        case "reader":
          const aReader =
            typeof a.loanId === "object" &&
            typeof a.loanId?.readerId === "object"
              ? `${a.loanId.readerId.reader_fname} ${a.loanId.readerId.reader_lname}`.toLowerCase()
              : "";
          const bReader =
            typeof b.loanId === "object" &&
            typeof b.loanId?.readerId === "object"
              ? `${b.loanId.readerId.reader_fname} ${b.loanId.readerId.reader_lname}`.toLowerCase()
              : "";
          aValue = aReader;
          bValue = bReader;
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

    setFilteredFines(list);
  }, [fines, searchTerm, sortBy, sortOrder, statusFilter, amountFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [createFinesResponse, finesResponse, loansResponse] =
        await Promise.all([
          finesApi.createForOverdueLoans(),
          finesApi.getAll(),
          loansApi.getAll(),
        ]);

      setFines(finesResponse.data.fines);
      setLoans(loansResponse.data.loans);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load fines");
      toast.error("Failed to fetch fines");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFine = async (data: FineFormData) => {
    try {
      const fineData = transformFineFormData(data);
      await finesApi.create(fineData);
      toast.success("Fine added successfully");
      setShowAddModal(false);
      addForm.reset();
      fetchData();
    } catch (error) {
      toast.error("Failed to add fine");
      console.error("Error adding fine:", error);
    }
  };

  const handlePayFine = async (fineId: string) => {
    try {
      await finesApi.pay(fineId);
      toast.success("Fine marked as paid");
      fetchData();
    } catch (error) {
      toast.error("Failed to pay fine");
    }
  };

  const handleCreateOverdueFines = async () => {
    try {
      const response = await finesApi.createForOverdueLoans();
      const createdCount = response.data.createdFines;
      if (createdCount > 0) {
        toast.success(`Created ${createdCount} new fines for overdue loans`);
      } else {
        toast("No overdue fines to create", { icon: "ℹ️" });
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to create overdue fines");
    }
  };

  const openAddModal = () => {
    addForm.reset(defaultFineFormValues);
    setShowAddModal(true);
  };

  const getFineStats = () => {
    const totalOutstanding = fines
      .filter((fine) => fine.status === "pending")
      .reduce((total, fine) => total + fine.accumulated_amount, 0);

    const pendingFines = fines.filter(
      (fine) => fine.status === "pending",
    ).length;

    const today = new Date();
    const paidToday = fines.filter((fine) => {
      if (fine.status !== "paid") return false;
      const updatedDate = new Date(fine.updatedAt);
      return updatedDate.toDateString() === today.toDateString();
    }).length;

    const waivedFines = fines.filter((fine) => fine.status === "waived").length;

    return { totalOutstanding, pendingFines, paidToday, waivedFines };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "waived":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "pending":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getSortDisplayName = (sortBy: string) => {
    switch (sortBy) {
      case "amount":
        return "Amount";
      case "status":
        return "Status";
      case "reader":
        return "Reader";
      case "date":
        return "Date";
      default:
        return "Date";
    }
  };

  const stats = getFineStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading fines...</div>
        </div>
      </DashboardLayout>
    );
  }

  const loanOptions = loans
    .filter((loan) => loan.status === "active")
    .map((loan) => {
      const bookTitle =
        typeof loan.bookId === "object"
          ? loan.bookId.book_title
          : "Unknown Book";
      const readerName =
        typeof loan.readerId === "object"
          ? `${loan.readerId.reader_fname} ${loan.readerId.reader_lname}`
          : "Unknown Reader";

      return {
        value: loan._id,
        label: `${bookTitle} - ${readerName}`,
      };
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fine Management
            </h1>
            <p className="text-muted-foreground">
              Manage overdue fines and payments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleCreateOverdueFines}>
              <Clock className="h-4 w-4 mr-2" />
              Check Overdue Fines
            </Button>
            <Button
              className="flex items-center space-x-2"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" />
              <span>Add Fine</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Outstanding
              </CardTitle>
              <Badge className="bg-red-100 text-red-800 border-0">
                <DollarSign className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatAmount(stats.totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingFines} pending fines
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Fines
              </CardTitle>
              <Badge className="bg-red-100 text-red-800 border-0">
                <AlertTriangle className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.pendingFines}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Today</CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0">
                <CheckCircle className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.paidToday}
              </div>
              <p className="text-xs text-muted-foreground">Payments received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Waived Fines
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                <Clock className="h-3 w-3" />
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.waivedFines}
              </div>
              <p className="text-xs text-muted-foreground">Forgiven fines</p>
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
                    placeholder="Search fines..."
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
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("pending")}
                    >
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("paid")}>
                      Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("waived")}>
                      Waived
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Amount
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Amount</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setAmountFilter("all")}>
                      All Amounts
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAmountFilter("under10")}
                    >
                      Under $10
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAmountFilter("10to50")}>
                      $10 - $50
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAmountFilter("over50")}>
                      Over $50
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
                    <DropdownMenuItem onClick={() => setSortBy("amount")}>
                      Amount
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("status")}>
                      Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("reader")}>
                      Reader Name
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
                {filteredFines.length} of {fines.length} fines
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Fines Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading fines...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Fines
              </h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button onClick={fetchData}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFines.map((fine) => {
              const loanData =
                typeof fine.loanId === "object" ? fine.loanId : null;
              const bookTitle =
                loanData && typeof loanData.bookId === "object"
                  ? loanData.bookId.book_title
                  : "Unknown Book";
              const readerName =
                loanData && typeof loanData.readerId === "object"
                  ? `${loanData.readerId.reader_fname} ${loanData.readerId.reader_lname}`
                  : "Unknown Reader";

              return (
                <Card
                  key={fine._id}
                  className="hover:shadow-lg group transition-shadow dark:shadow-gray-700"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-500 line-clamp-2">
                          {formatAmount(fine.accumulated_amount)}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {bookTitle}
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
                            onClick={() => setSelectedFine(fine)}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {fine.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handlePayFine(fine._id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-sm">{readerName}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-sm">
                          Rate: {fine.penalty_rate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        <Badge
                          className={`text-xs capitalize ${getStatusColor(fine.status)}`}
                        >
                          {fine.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Due Date
                        </span>
                        <span className="text-sm">
                          {new Date(fine.fine_due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Created
                        </span>
                        <span className="text-sm">
                          {new Date(fine.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredFines.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No fines found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? `No fines match your search for "${searchTerm}"`
                  : "No fines have been recorded yet"}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Your First Fine
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {selectedFine && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFine(null)}
          size="lg"
          title="Fine Details"
        >
          <div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">
                  {formatAmount(selectedFine.accumulated_amount)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(selectedFine.status)}>
                  {selectedFine.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Penalty Rate:</span>
                <span>{selectedFine.penalty_rate}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Due Date:</span>
                <span>
                  {new Date(selectedFine.fine_due_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {new Date(selectedFine.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selectedFine.updatedAt !== selectedFine.createdAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>
                    {new Date(selectedFine.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setSelectedFine(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Fine Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addForm.reset();
          }}
          size="lg"
          title="Add New Fine"
        >
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddFine)}
              className="space-y-4"
            >
              <ComboboxField
                control={addForm.control}
                name="loanId"
                label="Loan"
                placeholder="Select a loan"
                searchPlaceholder="Search loans..."
                emptyText="No active loans found."
                options={loanOptions}
                required
              />
              <TextField
                control={addForm.control}
                name="accumulated_amount"
                label="Fine Amount"
                type="number"
                placeholder="Enter fine amount"
              />
              <TextField
                control={addForm.control}
                name="penalty_rate"
                label="Penalty Rate (%)"
                type="number"
                placeholder="Enter penalty rate"
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
                  {addForm.formState.isSubmitting ? "Adding..." : "Add Fine"}
                </Button>
              </div>
            </form>
          </Form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
