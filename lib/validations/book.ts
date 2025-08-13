import { z } from "zod";

export const bookFormSchema = z.object({
  book_title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),

  authorId: z.string().min(1, "Author is required"),

  publisherId: z.string().min(1, "Publisher is required"),

  book_ISBN: z
    .string()
    .min(1, "ISBN is required")
    .regex(/^(?:\d{10}|\d{13})$/, "ISBN must be 10 or 13 digits"),

  release_date: z.string().min(1, "Release date is required"),

  book_tags: z
    .string()
    .min(1, "Genre/Tags is required")
    .max(100, "Genre/Tags must be less than 100 characters"),

  book_pages: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine(
      (val) => !isNaN(val) && val > 0 && val <= 10000,
      "Pages must be between 1 and 10000",
    ),

  book_description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  book_status: z
    .enum(["available", "borrowed", "maintenance", "lost"], {
      required_error: "Status is required",
    })
    .default("available"),
});

export type BookFormData = z.infer<typeof bookFormSchema>;

// Transform function to handle form data
export const transformBookFormData = (data: BookFormData) => ({
  ...data,
  book_pages: Number(data.book_pages),
  book_tags: data.book_tags
    ? data.book_tags.split(",").map((tag: string) => tag.trim())
    : [],
  book_description: data.book_description || undefined,
});

// Default values for the form
export const defaultBookFormValues = {
  book_title: "",
  authorId: "",
  publisherId: "",
  book_ISBN: "",
  release_date: "",
  book_tags: "",
  book_pages: 1,
  book_description: "",
  book_status: "available" as const,
};
