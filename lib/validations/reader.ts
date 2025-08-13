import { z } from "zod";

export const readerFormSchema = z.object({
  reader_fname: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  reader_lname: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  reader_email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  reader_phone_no: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number format"),

  reader_address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must not exceed 200 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain number")
    .regex(/(?=.*[!@#$%^&*])/, "Password must contain special character")
    .optional(),
});

export type ReaderFormData = z.infer<typeof readerFormSchema>;

// Transform function to handle form data
export const transformReaderFormData = (data: ReaderFormData) => ({
  ...data,
  password: data.password || undefined,
});

// Default values for the form
export const defaultReaderFormValues = {
  reader_fname: "",
  reader_lname: "",
  reader_email: "",
  reader_phone_no: "",
  reader_address: "",
  password: "",
};
