"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
  color?: "blue" | "green" | "yellow" | "red";
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-500 ml-1">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [readerStats, setReaderStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        if (user.role === "admin" || user.role === "librarian") {
          const response = await dashboardApi.getAdminStats();
          setAdminStats(response.data);
        } else if (user.role === "reader") {
          const response = await dashboardApi.getReaderStats();
          setReaderStats(response.data);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatsForRole = () => {
    if (loading) {
      return [
        {
          title: "Loading...",
          value: "...",
          description: "Fetching data",
          icon: BookOpen,
          color: "blue" as const,
        },
      ];
    }

    if (error) {
      return [
        {
          title: "Error",
          value: "!",
          description: error,
          icon: AlertTriangle,
          color: "red" as const,
        },
      ];
    }

    switch (user?.role) {
      case "admin":
      case "librarian":
        if (!adminStats) return [];
        return [
          {
            title: "Total Books",
            value: adminStats.totalBooks.count.toLocaleString(),
            description: "Books in library",
            icon: BookOpen,
            trend: adminStats.totalBooks.growth,
            color: "blue" as const,
          },
          {
            title: "Active Readers",
            value: adminStats.activeReaders.count.toLocaleString(),
            description: "Active readers",
            icon: Users,
            trend: adminStats.activeReaders.growth,
            color: "green" as const,
          },
          {
            title: "Active Loans",
            value: adminStats.activeLoans.count.toLocaleString(),
            description: `${adminStats.activeLoans.overdueCount} overdue`,
            icon: FileText,
            color:
              adminStats.activeLoans.overdueCount > 0
                ? ("yellow" as const)
                : ("blue" as const),
          },
          {
            title: "Outstanding Fines",
            value: `$${adminStats.outstandingFines.amount.toFixed(2)}`,
            description: "Unpaid fines",
            icon: DollarSign,
            color: "red" as const,
          },
        ];

      case "reader":
        if (!readerStats) return [];
        return [
          {
            title: "Active Loans",
            value: readerStats.activeLoans.count.toString(),
            description: "Books currently borrowed",
            icon: FileText,
            color: "blue" as const,
          },
          {
            title: "Due Soon",
            value: readerStats.dueSoon.toString(),
            description: "Books due in 3 days",
            icon: Clock,
            color:
              readerStats.dueSoon > 0
                ? ("yellow" as const)
                : ("green" as const),
          },
          {
            title: "Outstanding Fines",
            value: `$${readerStats.outstandingFines.amount.toFixed(2)}`,
            description: "Unpaid fines",
            icon: DollarSign,
            color:
              readerStats.outstandingFines.amount > 0
                ? ("red" as const)
                : ("green" as const),
          },
          {
            title: "Books Read",
            value: readerStats.totalBooksRead.toString(),
            description: "Total books completed",
            icon: CheckCircle,
            color: "green" as const,
          },
        ];

      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    const greeting =
      time < 12
        ? "Good morning"
        : time < 18
          ? "Good afternoon"
          : "Good evening";
    return `${greeting}, ${user?.name || "User"}!`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getWelcomeMessage()}
          </h1>
          <p className="text-muted-foreground">
            Welcome to your {user?.role} dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {getStatsForRole().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Additional sections for specific roles */}
        {user?.role === "reader" &&
          readerStats &&
          readerStats.activeLoans.count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {readerStats.activeLoans.books.map((loan: any) => (
                    <div
                      key={loan._id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{loan.bookId.book_title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due:{" "}
                          {new Date(loan.loan_due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Issued by: {loan.staffId.staff_fname}{" "}
                          {loan.staffId.staff_lname}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </DashboardLayout>
  );
}
