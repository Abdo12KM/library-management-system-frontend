"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Receipt,
} from "lucide-react";
import { finesApi } from "@/lib/api";
import { Fine, Loan, Book } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function MyFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyFines();
    }
  }, [user]);

  const fetchMyFines = async () => {
    try {
      setLoading(true);
      // Don't pass readerId - backend automatically filters based on authenticated user
      const response = await finesApi.getAll();
      console.log("Fines API response:", response);
      
      // Backend returns { status: "success", results: number, data: { fines: Fine[] } }
      let finesArray: Fine[] = [];
      
      if (response?.data?.fines && Array.isArray(response.data.fines)) {
        finesArray = response.data.fines;
      } else if ((response as any)?.fines && Array.isArray((response as any).fines)) {
        finesArray = (response as any).fines;
      } else if (Array.isArray(response?.data)) {
        finesArray = response.data as Fine[];
      } else if (Array.isArray(response)) {
        finesArray = response as Fine[];
      }
      
      console.log("Parsed fines array:", finesArray);
      setFines(finesArray);
      setError(null);
    } catch (error) {
      console.error("Error fetching fines:", error);
      setError("Failed to load your fines");
    } finally {
      setLoading(false);
    }
  };

  const getFineStats = () => {
    const outstandingBalance = fines
      .filter((fine) => fine.status === "pending")
      .reduce((total, fine) => total + fine.accumulated_amount, 0);

    const pendingFines = fines.filter(
      (fine) => fine.status === "pending",
    ).length;
    const paidFines = fines.filter((fine) => fine.status === "paid").length;
    const totalFines = fines.length;

    return { outstandingBalance, pendingFines, paidFines, totalFines };
  };

  const stats = getFineStats();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Fines</h1>
            <p className="text-muted-foreground">
              View your outstanding library fines - Payment must be made in
              person at the library
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-md flex items-center gap-2 border border-blue-200 dark:border-blue-800">
            <AlertTriangle className="h-4 w-4" />
            Pay in Person Only
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? "..." : `$${stats.outstandingBalance.toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">Total amount due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Fines
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.pendingFines}
              </div>
              <p className="text-xs text-muted-foreground">
                Unpaid fine records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Fines</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.paidFines}
              </div>
              <p className="text-xs text-muted-foreground">Successfully paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalFines}
              </div>
              <p className="text-xs text-muted-foreground">All time records</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Fines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Outstanding Fines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                <div className="animate-pulse">
                  Loading outstanding fines...
                </div>
              </div>
            ) : (
              (() => {
                const outstandingFines = fines.filter(
                  (fine) => fine.status === "pending",
                );

                return outstandingFines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                    <h3 className="text-lg font-medium mb-2 text-green-700 dark:text-green-400">
                      No Outstanding Fines
                    </h3>
                    <p>Great! You currently have no outstanding fines.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outstandingFines.map((fine, index) => {
                      const dueDate =
                        typeof fine.loanId === "object" &&
                        fine.loanId?.loan_due_date
                          ? new Date(fine.loanId.loan_due_date)
                          : null;
                      const currentDate = new Date();
                      const daysOverdue = dueDate
                        ? Math.max(
                            0,
                            Math.floor(
                              (currentDate.getTime() - dueDate.getTime()) /
                                (1000 * 60 * 60 * 24),
                            ),
                          )
                        : 0;

                      return (
                        <div
                          key={`${fine._id || index}`}
                          className={`flex justify-between items-center p-4 border-2 rounded-lg ${
                            fine.accumulated_amount >= 10
                              ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                              : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                          }`}
                        >
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                fine.accumulated_amount >= 10
                                  ? "text-red-700 dark:text-red-400"
                                  : "text-yellow-700 dark:text-yellow-400"
                              }`}
                            >
                              {typeof fine.loanId === "object" &&
                              fine.loanId?.bookId &&
                              typeof fine.loanId.bookId === "object"
                                ? fine.loanId.bookId.book_title
                                : "Unknown Book"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {daysOverdue > 0
                                ? `${daysOverdue} days overdue`
                                : "Recently overdue"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Due Date:{" "}
                                {dueDate ? dueDate.toLocaleDateString() : "N/A"}
                              </span>
                              <span>
                                Penalty Rate: ${fine.penalty_rate.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-xl font-bold ${
                                fine.accumulated_amount >= 10
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              ${fine.accumulated_amount.toFixed(2)}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Visit library to pay
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}

            {/* Payment Information */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                    Payment Information
                  </h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                    All fine payments must be made in person at the library.
                    Online payment is not available.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>
                        Visit the library front desk during operating hours
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>
                        Accepted payments: Cash, Credit Card, Debit Card
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Bring your library card and photo ID</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                <div className="animate-pulse">Loading recent payments...</div>
              </div>
            ) : (
              (() => {
                const paidFines = fines.filter(
                  (fine) => fine.status === "paid",
                );
                const recentPaidFines = paidFines
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt).getTime() -
                      new Date(a.updatedAt).getTime(),
                  )
                  .slice(0, 3); // Show only the 3 most recent payments

                return recentPaidFines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      No Recent Payments
                    </h3>
                    <p>You haven't made any fine payments recently</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPaidFines.map((fine, index) => (
                      <div
                        key={`${fine._id || index}`}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">
                            {typeof fine.loanId === "object" &&
                            fine.loanId?.bookId &&
                            typeof fine.loanId.bookId === "object"
                              ? fine.loanId.bookId.book_title
                              : "Unknown Book"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Paid on{" "}
                            {new Date(fine.updatedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Payment Method: In Person
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            ${fine.accumulated_amount.toFixed(2)}
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>

        {/* Fine History & Tips */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fine History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-pulse">Loading fine history...</div>
                </div>
              ) : fines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Fine History</h3>
                  <p className="mb-4">You have no fine records yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {fines.map((fine, index) => (
                    <div
                      key={`${fine._id || index}`}
                      className={`flex justify-between items-center p-3 border rounded-lg ${
                        fine.status === "paid"
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {typeof fine.loanId === "object" &&
                          fine.loanId?.bookId &&
                          typeof fine.loanId.bookId === "object"
                            ? fine.loanId.bookId.book_title
                            : "Unknown Book"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {fine.status === "paid"
                            ? `Paid on ${new Date(fine.updatedAt).toLocaleDateString()}`
                            : `Outstanding since ${new Date(fine.createdAt).toLocaleDateString()}`}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>
                            Due:{" "}
                            {typeof fine.loanId === "object" &&
                            fine.loanId?.loan_due_date
                              ? new Date(
                                  fine.loanId.loan_due_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <span>
                            Penalty Rate: ${fine.penalty_rate || "0.00"}
                          </span>
                          <span>
                            Fine Due:{" "}
                            {new Date(fine.fine_due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div
                            className={`font-medium ${
                              fine.status === "paid"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${fine.accumulated_amount?.toFixed(2) || "0.00"}
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              fine.status === "paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : fine.status === "waived"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {fine.status.charAt(0).toUpperCase() +
                              fine.status.slice(1)}
                          </div>
                        </div>
                        {fine.status === "paid" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : fine.status === "waived" ? (
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avoid Future Fines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Set Calendar Reminders</p>
                    <p className="text-muted-foreground">
                      Add due dates to your calendar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Renew Early</p>
                    <p className="text-muted-foreground">
                      Renew books before they're due
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-muted-foreground">
                      Enable email reminders in settings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
