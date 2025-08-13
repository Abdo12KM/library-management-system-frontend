import { z } from "zod";

export const publisherFormSchema = z.object({
  publisher_name: z
    .string()
    .min(2, "Publisher name must be at least 2 characters")
    .max(100, "Publisher name must not exceed 100 characters")
    .trim(),

  publisher_website: z
    .string()
    .url("Invalid website URL format")
    .optional()
    .or(z.literal("")),

  year_of_publication: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine(
      (val) => !isNaN(val) && val >= 1000 && val <= new Date().getFullYear(),
      `Year must be between 1000 and ${new Date().getFullYear()}`,
    )
    .optional(),

  no_published_books: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine(
      (val) => !isNaN(val) && val >= 0,
      "Number of published books cannot be negative",
    )
    .default(0),
});

export type PublisherFormData = z.infer<typeof publisherFormSchema>;

// Transform function to handle form data
export const transformPublisherFormData = (data: PublisherFormData) => ({
  ...data,
  publisher_website: data.publisher_website || undefined,
  year_of_publication: data.year_of_publication
    ? Number(data.year_of_publication)
    : undefined,
  no_published_books: Number(data.no_published_books) || 0,
});

// Default values for the form
export const defaultPublisherFormValues = {
  publisher_name: "",
  publisher_website: "",
  year_of_publication: new Date().getFullYear(),
  no_published_books: 0,
};
