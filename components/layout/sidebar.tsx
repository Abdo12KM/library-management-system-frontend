"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import {
  BookOpen,
  Users,
  UserCheck,
  FileText,
  DollarSign,
  Home,
  Search,
  Settings,
  Building2,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "librarian", "reader"],
  },
  // Admin only
  {
    title: "Staff Management",
    href: "/dashboard/staff",
    icon: UserCog,
    roles: ["admin"],
  },
  // Admin and Librarian
  {
    title: "Books",
    href: "/dashboard/books",
    icon: BookOpen,
    roles: ["admin", "librarian"],
  },
  {
    title: "Authors",
    href: "/dashboard/authors",
    icon: UserCheck,
    roles: ["admin", "librarian"],
  },
  {
    title: "Publishers",
    href: "/dashboard/publishers",
    icon: Building2,
    roles: ["admin", "librarian"],
  },
  {
    title: "Readers",
    href: "/dashboard/readers",
    icon: Users,
    roles: ["admin", "librarian"],
  },
  {
    title: "Loans",
    href: "/dashboard/loans",
    icon: FileText,
    roles: ["admin", "librarian"],
  },
  {
    title: "Fines",
    href: "/dashboard/fines",
    icon: DollarSign,
    roles: ["admin", "librarian"],
  },
  // Reader only
  {
    title: "Browse Books",
    href: "/dashboard/catalog",
    icon: Search,
    roles: ["reader"],
  },
  {
    title: "My Loans",
    href: "/dashboard/my-loans",
    icon: FileText,
    roles: ["reader"],
  },
  {
    title: "My Fines",
    href: "/dashboard/my-fines",
    icon: DollarSign,
    roles: ["reader"],
  },
  // All roles
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: Settings,
    roles: ["admin", "librarian", "reader"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const filteredNavItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800";
      case "librarian":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800";
      case "reader":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-card border-r border-border shadow-sm transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!sidebarCollapsed && (
          <h2 className="text-md font-semibold text-foreground">Library MS</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                sidebarCollapsed && "justify-center",
              )}
              title={sidebarCollapsed ? item.title : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground",
                  !sidebarCollapsed && "mr-3",
                )}
              />
              {!sidebarCollapsed && (
                <>
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-destructive px-2 py-1 text-xs text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2">
        <ThemeToggle />
      </div>

      {/* User Section */}
      <div className="border-t border-border p-4">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 min-w-0">
                <Badge
                  variant="secondary"
                  className={`capitalize ${getRoleBadgeColor(user?.role || "")}`}
                >
                  {user?.role || "User"}
                </Badge>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
