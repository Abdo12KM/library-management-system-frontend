import { z } from "zod";

export const staffFormSchema = z.object({
  staff_fname: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  staff_lname: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  staff_email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  role: z
    .enum(["librarian", "admin"], {
      required_error: "Role is required",
    })
    .default("librarian"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain number")
    .regex(/(?=.*[!@#$%^&*])/, "Password must contain special character")
    .optional(),

  staff_join_date: z.string().min(1, "Join date is required").optional(),
});

export type StaffFormData = z.infer<typeof staffFormSchema>;

// Transform function to handle form data
export const transformStaffFormData = (data: StaffFormData) => ({
  ...data,
  password: data.password || undefined,
  staff_join_date:
    data.staff_join_date || new Date().toISOString().split("T")[0],
});

// Default values for the form
export const defaultStaffFormValues = {
  staff_fname: "",
  staff_lname: "",
  staff_email: "",
  role: "librarian" as const,
  password: "",
  staff_join_date: new Date().toISOString().split("T")[0],
};
