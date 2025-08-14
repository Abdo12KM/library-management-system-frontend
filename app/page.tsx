"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { BookOpen, Users, Clock, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-accent/70 flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">
                Library MS
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 shadow hover:shadow-md"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Modern Library
            <span className="text-primary"> Management</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your library operations with our comprehensive management
            system. Manage books, track loans, handle fines, and provide
            excellent service to your readers.
          </p>
          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow transition-shadow duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Book Management
            </h3>
            <p className="text-muted-foreground">
              Complete catalog management with author and publisher tracking.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow transition-shadow duration-200">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Staff Management
            </h3>
            <p className="text-muted-foreground">
              Manage staff, and role-based access control.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow transition-shadow duration-200">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Loan Tracking
            </h3>
            <p className="text-muted-foreground">
              Track book loans, due dates, and overdues.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Secure & Reliable
            </h3>
            <p className="text-muted-foreground">
              JWT authentication with role-based security features.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card dark:text-white text-black py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6" />
              <span className="ml-2 text-lg font-semibold">Library MS</span>
            </div>
            <div className="text-gray-500">
              © 2025 Library Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
