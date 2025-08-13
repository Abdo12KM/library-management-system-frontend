import axios from "axios";
import type {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  User,
  Reader,
  Staff,
  Book,
  Author,
  Publisher,
  Loan,
  Fine,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  loginReader: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post("/auth/login/reader", credentials);
    return response.data;
  },

  loginStaff: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post("/auth/login/staff", credentials);
    return response.data;
  },

  registerReader: async (
    data: RegisterData,
  ): Promise<{ message: string; data: Reader; token: string }> => {
    const response = await api.post("/auth/signup/reader", data);
    return response.data;
  },
};

// Books API
export const booksApi = {
  // Backend returns { status, results, data: { books: Book[] } }
  getAll: async (
    params?: Record<string, any>,
  ): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get("/books", { params });
    return response.data;
  },

  // Backend returns { status, data: { book: Book } }
  getById: async (id: string): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  create: async (data: Partial<Book>): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.post("/books", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Book>,
  ): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.patch(`/books/${id}`, data);
    return response.data;
  },

  updateStatus: async (
    id: string,
    book_status: string,
  ): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.patch(`/books/${id}/status`, { book_status });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
};

// Authors API
export const authorsApi = {
  getAll: async (
    params?: Record<string, any>,
  ): Promise<ApiResponse<{ authors: Author[] }>> => {
    const response = await api.get("/authors", { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ author: Author }>> => {
    const response = await api.get(`/authors/${id}`);
    return response.data;
  },

  create: async (
    data: Partial<Author>,
  ): Promise<ApiResponse<{ author: Author }>> => {
    const response = await api.post("/authors", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Author>,
  ): Promise<ApiResponse<{ author: Author }>> => {
    const response = await api.patch(`/authors/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/authors/${id}`);
    return response.data;
  },
};

// Publishers API
export const publishersApi = {
  getAll: async (
    params?: Record<string, any>,
  ): Promise<ApiResponse<{ publishers: Publisher[] }>> => {
    const response = await api.get("/publishers", { params });
    return response.data;
  },

  getById: async (
    id: string,
  ): Promise<ApiResponse<{ publisher: Publisher }>> => {
    const response = await api.get(`/publishers/${id}`);
    return response.data;
  },

  create: async (
    data: Partial<Publisher>,
  ): Promise<ApiResponse<{ publisher: Publisher }>> => {
    const response = await api.post("/publishers", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Publisher>,
  ): Promise<ApiResponse<{ publisher: Publisher }>> => {
    const response = await api.patch(`/publishers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/publishers/${id}`);
    return response.data;
  },
};

// Readers API
export const readersApi = {
  getAll: async (
    params?: Record<string, any>,
  ): Promise<{ message: string; length: number; data: Reader[] }> => {
    const response = await api.get("/readers", { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ message: string; data: Reader }> => {
    const response = await api.get(`/readers/${id}`);
    return response.data;
  },

  getMe: async (): Promise<{ data: Reader }> => {
    const response = await api.get("/readers/getMe");
    return response.data;
  },

  updateMe: async (
    data: Partial<Reader>,
  ): Promise<{ message: string; data: Reader }> => {
    const response = await api.patch("/readers/updateMe", data);
    return response.data;
  },

  updateMyPassword: async (data: {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
  }): Promise<{ message: string }> => {
    const response = await api.patch("/readers/updateMyPassword", data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/readers/${id}`);
  },
};

// Staff API
export const staffApi = {
  getAll: async (
    params?: Record<string, any>,
  ): Promise<{ message: string; length: number; data: Staff[] }> => {
    const response = await api.get("/staff", { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ message: string; data: Staff }> => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  getMe: async (): Promise<{ staff: Staff }> => {
    const response = await api.get("/staff/getMe");
    return response.data;
  },

  updateMe: async (
    data: Partial<Staff>,
  ): Promise<{ message: string; data: Staff }> => {
    const response = await api.patch("/staff/updateMe", data);
    return response.data;
  },

  updateMyPassword: async (data: {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
  }): Promise<{ message: string }> => {
    const response = await api.patch("/staff/updateMyPassword", data);
    return response.data;
  },

  create: async (
    data: Partial<Staff>,
  ): Promise<{ message: string; data: Staff }> => {
    const response = await api.post("/staff", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Staff>,
  ): Promise<ApiResponse<Staff>> => {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/staff/${id}`);
  },
};

// Loans API
export const loansApi = {
  getAll: async (
    params?: Record<string, any>,
  ): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const response = await api.get("/loans", { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Loan>> => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  create: async (data: {
    bookId: string;
    readerId: string;
  }): Promise<ApiResponse<{ loan: Loan }>> => {
    const response = await api.post("/loans", data);
    return response.data;
  },

  return: async (id: string): Promise<ApiResponse<{ loan: Loan }>> => {
    const response = await api.patch(`/loans/${id}/return`);
    return response.data;
  },

  getOverdue: async (
    params?: Record<string, any>,
  ): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const response = await api.get("/loans/overdue", { params });
    return response.data;
  },
};

// Fines API
export const finesApi = {
  getAll: async (
    params?: Record<string, any>,
  ): Promise<ApiResponse<{ fines: Fine[] }>> => {
    const response = await api.get("/fines", { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Fine>> => {
    const response = await api.get(`/fines/${id}`);
    return response.data;
  },

  create: async (data: {
    loanId: string;
    accumulated_amount?: number;
    penalty_rate?: number;
  }): Promise<ApiResponse<{ fine: Fine }>> => {
    const response = await api.post("/fines", data);
    return response.data;
  },

  pay: async (id: string): Promise<ApiResponse<{ fine: Fine }>> => {
    const response = await api.patch(`/fines/${id}/pay`);
    return response.data;
  },

  createForOverdueLoans: async (): Promise<
    ApiResponse<{ createdFines: number }> & { message: string }
  > => {
    const response = await api.post("/fines/overdue");
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getAdminStats: async (): Promise<
    ApiResponse<{
      totalBooks: {
        count: number;
        growth: string;
      };
      activeReaders: {
        count: number;
        growth: string;
      };
      activeLoans: {
        count: number;
        overdueCount: number;
      };
      outstandingFines: {
        amount: number;
      };
      booksStats: Array<{ _id: string; count: number }>;
      loanTrends: Array<{ _id: string; count: number }>;
      overdueLoans: number;
    }>
  > => {
    const response = await api.get("/dashboard/admin");
    return response.data;
  },

  getReaderStats: async (): Promise<
    ApiResponse<{
      activeLoans: {
        count: number;
        books: Array<{
          _id: string;
          bookId: { book_title: string };
          staffId: { staff_fname: string; staff_lname: string };
          loan_due_date: string;
          loan_issue_date: string;
        }>;
      };
      dueSoon: number;
      outstandingFines: {
        amount: number;
      };
      totalBooksRead: number;
      recentHistory: Array<{
        _id: string;
        bookId: { book_title: string };
        loan_return_date: string;
      }>;
    }>
  > => {
    const response = await api.get("/dashboard/reader");
    return response.data;
  },
};

export default api;
