"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  CheckCircle,
  RotateCcw,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { loansApi } from "@/lib/api";
import { Loan, Book, Reader } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function MyLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyLoans();
    }
  }, [user]);

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const response = await loansApi.getAll({ readerId: user?.id });
      // Normalize various possible response shapes into an array of loans
      const raw = (response as any)?.data;
      const arr: Loan[] = Array.isArray(raw?.loans)
        ? raw.loans
        : Array.isArray(raw)
          ? raw
          : Array.isArray((response as any)?.loans)
            ? (response as any).loans
            : Array.isArray((response as any)?.data?.loans)
              ? (response as any).data.loans
              : [];
      setLoans(arr);
      setError(null);
    } catch (error) {
      console.error("Error fetching loans:", error);
      setError("Failed to load your loans");
    } finally {
      setLoading(false);
    }
  };

  const getMyLoanStats = () => {
    const currentLoans = loans.filter(
      (loan) => loan.status === "active",
    ).length;
    const overdueLoans = loans.filter(
      (loan) => loan.status === "overdue",
    ).length;
    const totalLoans = loans.length;
    const dueSoon = loans.filter((loan) => {
      if (loan.status !== "active") return false;
      const dueDate = new Date(loan.loan_due_date);
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      return dueDate <= threeDaysFromNow && dueDate >= today;
    }).length;

    return { currentLoans, overdueLoans, totalLoans, dueSoon };
  };

  const stats = getMyLoanStats();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
            <p className="text-muted-foreground">
              Track your current and past book loans
            </p>
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 px-4 py-2 rounded-md flex items-center gap-2 border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4" />
              Error loading loans
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Loans
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.currentLoans}
              </div>
              <p className="text-xs text-muted-foreground">
                Books currently borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.dueSoon}
              </div>
              <p className="text-xs text-muted-foreground">
                Due in 3 days or less
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.overdueLoans}
              </div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalLoans}
              </div>
              <p className="text-xs text-muted-foreground">All time loans</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Current Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Loading your loans...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <button
                  onClick={fetchMyLoans}
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            ) : loans.filter(
                (loan) => loan.status === "active" || loan.status === "overdue",
              ).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Active Loans</h3>
                <p className="mb-4">
                  You don't have any books currently borrowed
                </p>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md">
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {loans
                  .filter(
                    (loan) =>
                      loan.status === "active" || loan.status === "overdue",
                  )
                  .map((loan) => {
                    const book = loan.bookId as Book;
                    const dueDate = new Date(loan.loan_due_date);
                    const today = new Date();
                    const isOverdue = dueDate < today;
                    const daysLeft = Math.ceil(
                      (dueDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <div
                        key={loan._id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {book?.book_title || "Unknown Book"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {typeof book?.authorId === "object"
                              ? book.authorId.author_name
                              : "Unknown Author"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              Borrowed:{" "}
                              {new Date(
                                loan.loan_start_date,
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={
                                isOverdue ? "text-red-600" : "text-green-600"
                              }
                            >
                              Due: {dueDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isOverdue
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : daysLeft <= 3
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {isOverdue
                              ? "OVERDUE"
                              : daysLeft <= 0
                                ? "Due today"
                                : `${daysLeft} days left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Returned</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                <div className="animate-pulse">Loading returned books...</div>
              </div>
            ) : (
              (() => {
                const returnedLoans = loans
                  .filter(loan => loan.status === "returned" && loan.loan_return_date)
                  .sort((a, b) => new Date(b.loan_return_date!).getTime() - new Date(a.loan_return_date!).getTime())
                  .slice(0, 3); // Show only the 3 most recent returns

                return returnedLoans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Recent Returns</h3>
                    <p>You haven't returned any books recently</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {returnedLoans.map((loan) => {
                      const book = loan.bookId as Book;
                      return (
                        <div key={loan._id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{book?.book_title || "Unknown Book"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {typeof book?.authorId === "object"
                                ? book.authorId.author_name
                                : "Unknown Author"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Returned: {new Date(loan.loan_return_date!).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-xs text-muted-foreground">Returned</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>

        {/* Loan History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Loan History</CardTitle>
              <button className="text-primary hover:text-primary/80 text-sm">
                View All History
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-pulse">Loading loan history...</div>
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Loan History</h3>
                <p className="mb-4">You haven't borrowed any books yet</p>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md">
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {loans
                  .sort((a, b) => new Date(b.loan_start_date).getTime() - new Date(a.loan_start_date).getTime())
                  .map((loan) => {
                    const book = loan.bookId as Book;
                    return (
                      <div
                        key={loan._id}
                        className={`flex justify-between items-center p-3 border rounded-lg ${
                          loan.status === "returned"
                            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : loan.status === "overdue"
                            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                            : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{book?.book_title || "Unknown Book"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {typeof book?.authorId === "object"
                              ? book.authorId.author_name
                              : "Unknown Author"}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Borrowed: {new Date(loan.loan_start_date).toLocaleDateString()}</span>
                            <span>Due: {new Date(loan.loan_due_date).toLocaleDateString()}</span>
                            {loan.loan_return_date && (
                              <span>Returned: {new Date(loan.loan_return_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              loan.status === "returned"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : loan.status === "overdue"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            }`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </div>
                          </div>
                          {loan.status === "returned" ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : loan.status === "overdue" ? (
                            <Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
