import { z } from "zod";

export const loanFormSchema = z.object({
  readerId: z.string().min(1, "Reader is required"),
  bookId: z.string().min(1, "Book is required"),
});

export type LoanFormData = z.infer<typeof loanFormSchema>;

// Transform function to handle form data
export const transformLoanFormData = (data: LoanFormData) => ({
  ...data,
});

// Default values for the form
export const defaultLoanFormValues = {
  readerId: "",
  bookId: "",
};
