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
      const response = await finesApi.getAll({ readerId: user?.id });
      // Normalize various possible response shapes into an array of fines
      const raw = (response as any)?.data;
      const arr: Fine[] = Array.isArray(raw?.fines)
        ? raw.fines
        : Array.isArray(raw)
          ? raw
          : Array.isArray((response as any)?.fines)
            ? (response as any).fines
            : Array.isArray((response as any)?.data?.fines)
              ? (response as any).data.fines
              : [];
      setFines(arr);
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
              View and pay your outstanding library fines
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pay All Fines
          </button>
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
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border-2 border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div className="flex-1">
                  <h3 className="font-medium text-red-700 dark:text-red-400">
                    The Great Gatsby
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    7 days overdue
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Due Date: Jan 28, 2024</span>
                    <span>Daily Rate: $1.50</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600">$10.50</div>
                  <button className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded">
                    Pay Now
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-700 dark:text-yellow-400">
                    To Kill a Mockingbird
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    2 days overdue
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Due Date: Feb 1, 2024</span>
                    <span>Daily Rate: $2.50</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-600">$5.00</div>
                  <button className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-1 rounded">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-3">Payment Options</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <button className="flex items-center gap-2 p-3 border rounded-lg hover:bg-white dark:hover:bg-gray-800">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Credit Card</span>
                </button>
                <button className="flex items-center gap-2 p-3 border rounded-lg hover:bg-white dark:hover:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Cash (In Person)</span>
                </button>
                <button className="flex items-center gap-2 p-3 border rounded-lg hover:bg-white dark:hover:bg-gray-800">
                  <Receipt className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Bank Transfer</span>
                </button>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Pride and Prejudice</h3>
                  <p className="text-sm text-muted-foreground">
                    Paid on Jan 15, 2024
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payment Method: Credit Card
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">$12.00</div>
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">The Catcher in the Rye</h3>
                  <p className="text-sm text-muted-foreground">
                    Paid on Jan 10, 2024
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payment Method: Cash
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">$8.50</div>
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fine History & Tips */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fine History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Complete Payment History
                </h3>
                <p className="mb-4">View all your fine payments and records</p>
                <button className="text-primary hover:text-primary/80 text-sm">
                  View Full History →
                </button>
              </div>
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
