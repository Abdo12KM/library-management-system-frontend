export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "librarian" | "reader";
}

export interface Reader {
  _id: string;
  reader_fname: string;
  reader_lname: string;
  reader_email: string;
  reader_phone_no: string;
  reader_address: string;
  role: "reader";
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  _id: string;
  staff_fname: string;
  staff_lname: string;
  staff_email: string;
  staff_join_date: string;
  role: "admin" | "librarian";
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  _id: string;
  author_name: string;
  email: string;
  biography?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  _id: string;
  publisher_name: string;
  publisher_website?: string;
  year_of_publication?: number;
  no_published_books: number;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  book_title: string;
  book_description?: string;
  book_pages: number;
  release_date: string;
  book_tags?: string[];
  book_ISBN?: string;
  book_status: "available" | "borrowed" | "maintenance" | "lost";
  authorId: string | Author;
  publisherId: string | Publisher;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  _id: string;
  readerId: string | Reader;
  staffId: string | Staff;
  bookId: string | Book;
  loan_start_date: string;
  loan_due_date: string;
  loan_return_date?: string;
  status: "active" | "returned" | "overdue";
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Fine {
  _id: string;
  loanId: string | Loan;
  fine_due_date: string;
  accumulated_amount: number;
  penalty_rate: number;
  status: "pending" | "paid" | "waived";
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  results?: number;
  token?: string;
}

export interface ApiError {
  status: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  reader_fname: string;
  reader_lname: string;
  reader_email: string;
  reader_phone_no: string;
  reader_address: string;
  password: string;
}

export interface StaffFormData {
  staff_fname: string;
  staff_lname: string;
  staff_email: string;
  role: "admin" | "librarian";
  password: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalReaders: number;
  activeLoans: number;
  totalFines: number;
  overdueLoans: number;
  recentActivity: any[];
}
