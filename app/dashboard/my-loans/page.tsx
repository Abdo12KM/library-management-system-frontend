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
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Renew All
          </button>
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
                        <div className="flex flex-col gap-2">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded">
                            Renew
                          </button>
                          <span
                            className={`text-xs text-center ${
                              isOverdue
                                ? "text-red-600"
                                : daysLeft <= 3
                                  ? "text-yellow-600"
                                  : "text-green-600"
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
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Pride and Prejudice</h3>
                  <p className="text-sm text-muted-foreground">Jane Austen</p>
                  <p className="text-xs text-muted-foreground">
                    Returned: Jan 10, 2024
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    Rate Book
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">The Catcher in the Rye</h3>
                  <p className="text-sm text-muted-foreground">J.D. Salinger</p>
                  <p className="text-xs text-muted-foreground">
                    Returned: Jan 8, 2024
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    Rate Book
                  </button>
                </div>
              </div>
            </div>
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
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Complete Loan History
              </h3>
              <p className="mb-4">
                View your complete borrowing history with detailed statistics
              </p>
              <div className="text-sm space-y-1">
                <div>• Track all past loans and returns</div>
                <div>• View reading patterns and preferences</div>
                <div>• Export loan history data</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
