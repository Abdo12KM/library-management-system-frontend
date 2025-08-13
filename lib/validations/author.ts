import { z } from "zod";

export const authorFormSchema = z.object({
  author_name: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name must not exceed 100 characters")
    .trim(),

  email: z.string().min(1, "Email is required").email("Invalid email format"),

  biography: z
    .string()
    .max(1000, "Biography must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type AuthorFormData = z.infer<typeof authorFormSchema>;

// Transform function to handle form data
export const transformAuthorFormData = (data: AuthorFormData) => ({
  ...data,
  biography: data.biography || undefined,
});

// Default values for the form
export const defaultAuthorFormValues = {
  author_name: "",
  email: "",
  biography: "",
};
