# Library Management System - Frontend

A modern, responsive library management system built with Next.js, TypeScript, and Tailwind CSS. This application provides a comprehensive interface for managing library operations including book catalog, user management, loans, fines, and administrative tasks.

## 🚀 Features

### Reader Features
- **Dashboard**: Overview of active loans, due dates, and outstanding fines
- **Book Catalog**: Browse and search through the library's book collection
- **My Loans**: Track current and past book loans with status indicators
- **My Fines**: View outstanding fines and payment history (in-person payment only)
- **Profile Management**: Update personal information and account settings

### Staff/Admin Features
- **Administrative Dashboard**: System-wide statistics and insights
- **Book Management**: Add, edit, and manage book inventory
- **Author & Publisher Management**: Maintain author and publisher databases
- **Reader Management**: View and manage library member accounts
- **Staff Management**: Manage library staff accounts (admin only)
- **Loan Management**: Process book loans and returns
- **Fine Management**: Track and manage library fines

### Authentication
- Separate login systems for readers and staff
- Role-based access control (Reader, Librarian, Admin)
- Secure JWT-based authentication

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: React Context + useState/useEffect
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **pnpm** (recommended) or npm/yarn
- **Library Management System Backend** (running on http://localhost:5000)

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abdo12KM/library-management-system-frontend.git
cd library-management-system-frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # Dashboard and main application pages
│   │   ├── authors/       # Author management
│   │   ├── books/         # Book catalog and management
│   │   ├── catalog/       # Public book catalog
│   │   ├── fines/         # Fine management
│   │   ├── loans/         # Loan management
│   │   ├── my-fines/      # User's personal fines
│   │   ├── my-loans/      # User's personal loans
│   │   ├── profile/       # User profile
│   │   ├── publishers/    # Publisher management
│   │   ├── readers/       # Reader management
│   │   └── staff/         # Staff management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── layout/           # Layout components
│   │   ├── dashboard-layout.tsx
│   │   └── sidebar.tsx
│   ├── ui/               # UI components (buttons, cards, forms, etc.)
│   ├── auth-provider.tsx # Authentication context
│   └── providers.tsx     # Global providers
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useHydration.ts   # Hydration hook
│   └── useTheme.ts       # Theme management hook
├── lib/                  # Utility libraries
│   ├── api.ts            # API client and endpoints
│   ├── colors.ts         # Color utilities
│   ├── utils.ts          # General utilities
│   └── validations/      # Form validation schemas
├── store/                # State management
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
```

## 🎨 Features Overview

### Dashboard
- **Reader Dashboard**: Personal overview with active loans, due dates, and fine summaries
- **Admin Dashboard**: System-wide statistics, user metrics, and operational insights

### Book Management
- Comprehensive book catalog with search and filtering
- Book status tracking (available, borrowed, maintenance, lost)
- Author and publisher relationship management

### Loan System
- Real-time loan tracking with due date calculations
- Overdue detection and fine generation
- Loan history with detailed records

### Fine Management
- Automated fine calculation for overdue books
- In-person payment processing (no online payments)
- Fine history and payment tracking

### User Management
- Role-based access control
- Profile management for readers
- Staff account management for administrators

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check

# Formatting
pnpm format       # Format code with Prettier
```

## 🌙 Theme Support

The application supports both light and dark themes with automatic system preference detection and manual toggle functionality.

## 📱 Responsive Design

Fully responsive design that works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🔐 Authentication & Authorization

- **JWT-based authentication** for secure API communication
- **Role-based access control** with three user roles:
  - **Reader**: Basic library member access
  - **Librarian**: Staff access for daily operations
  - **Admin**: Full system administration access
- **Protected routes** based on authentication status and user role

## 🔗 API Integration

The frontend integrates with a RESTful API backend providing:
- User authentication and authorization
- CRUD operations for all entities (books, authors, publishers, loans, fines)
- Real-time data updates
- Error handling and validation

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com/):

```bash
npx vercel
```

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Abdo12KM** - *Initial work* - [GitHub](https://github.com/Abdo12KM)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you have any questions or need help with the project, please open an issue on GitHub.

---

**Note**: This is the frontend application for the Library Management System. Make sure you have the corresponding backend API running for full functionality.
