import { z } from "zod";

export const fineFormSchema = z.object({
  loanId: z.string().min(1, "Loan is required"),

  accumulated_amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, "Fine amount cannot be negative")
    .optional()
    .default(0),

  penalty_rate: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, "Penalty rate cannot be negative")
    .optional()
    .default(1.0),
});

export type FineFormData = z.infer<typeof fineFormSchema>;

// Transform function to handle form data
export const transformFineFormData = (data: FineFormData) => ({
  ...data,
  accumulated_amount: Number(data.accumulated_amount) || 0,
  penalty_rate: Number(data.penalty_rate) || 1.0,
});

// Default values for the form
export const defaultFineFormValues = {
  loanId: "",
  accumulated_amount: 0,
  penalty_rate: 1.0,
};
