// Library Management System Color Utilities
// This file contains utility functions and constants for consistent color usage

export const colorScheme = {
  // Primary colors - Library-inspired teal/blue-green
  primary: {
    DEFAULT: "hsl(199, 89%, 48%)", // Main primary color
    light: "hsl(199, 95%, 94%)", // Light variant for backgrounds
    dark: "hsl(199, 89%, 20%)", // Dark variant for text
  },

  // Status colors
  success: {
    DEFAULT: "hsl(142, 71%, 45%)",
    light: "hsl(142, 71%, 94%)",
    dark: "hsl(142, 71%, 25%)",
  },

  warning: {
    DEFAULT: "hsl(38, 92%, 50%)",
    light: "hsl(38, 92%, 94%)",
    dark: "hsl(38, 92%, 30%)",
  },

  destructive: {
    DEFAULT: "hsl(0, 84%, 60%)",
    light: "hsl(0, 84%, 94%)",
    dark: "hsl(0, 84%, 30%)",
  },

  // Neutral colors with improved contrast
  neutral: {
    50: "hsl(220, 14%, 96%)",
    100: "hsl(220, 13%, 91%)",
    200: "hsl(220, 13%, 85%)",
    300: "hsl(220, 9%, 60%)",
    400: "hsl(220, 9%, 46%)",
    500: "hsl(220, 9%, 32%)",
    600: "hsl(220, 14%, 20%)",
    700: "hsl(220, 20%, 14%)",
    800: "hsl(224, 71%, 8%)",
    900: "hsl(224, 71%, 4%)",
  },
} as const;

/**
 * Get role-specific badge colors
 */
export const getRoleBadgeColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "librarian":
      return "bg-primary/10 text-primary border-primary/20";
    case "reader":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Get status-specific colors
 */
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "available":
    case "paid":
    case "returned":
      return "bg-success/10 text-success border-success/20";
    case "overdue":
    case "pending":
    case "late":
      return "bg-warning/10 text-warning border-warning/20";
    case "inactive":
    case "unavailable":
    case "unpaid":
    case "lost":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Get priority-specific colors
 */
export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
    case "urgent":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "medium":
    case "normal":
      return "bg-warning/10 text-warning border-warning/20";
    case "low":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Common CSS classes for consistent styling
 */
export const commonStyles = {
  // Input styling
  input:
    "border-input-border bg-input text-foreground placeholder:text-input-placeholder focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200",

  // Button styling
  buttonPrimary:
    "bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md transition-all duration-200",
  buttonSecondary:
    "bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm hover:shadow transition-all duration-200",
  buttonOutline:
    "border border-input-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow transition-all duration-200",

  // Card styling
  card: "bg-card text-card-foreground border border-border shadow-sm hover:shadow transition-shadow duration-200 rounded-lg",

  // Text styling
  headingPrimary: "text-foreground font-bold",
  textSecondary: "text-muted-foreground",
  textPrimary: "text-foreground",
} as const;
