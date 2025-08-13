"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    reader_fname: "",
    reader_lname: "",
    reader_email: "",
    reader_phone_no: "",
    reader_address: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authApi.registerReader(registerData);

      if (response.token && response.data) {
        const user = {
          id: response.data._id,
          name: response.data.fullName,
          email: response.data.reader_email,
          role: response.data.role as "reader",
        };

        login(user, response.token);
        toast.success("Registration successful!");
        router.push("/reader");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full shadow-lg">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join Our Library
          </h1>
          <p className="text-muted-foreground">
            Create your reader account to start borrowing books
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="reader_fname"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  First Name
                </label>
                <input
                  id="reader_fname"
                  name="reader_fname"
                  type="text"
                  required
                  value={formData.reader_fname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label
                  htmlFor="reader_lname"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Last Name
                </label>
                <input
                  id="reader_lname"
                  name="reader_lname"
                  type="text"
                  required
                  value={formData.reader_lname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="reader_email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  id="reader_email"
                  name="reader_email"
                  type="email"
                  required
                  value={formData.reader_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="reader_phone_no"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="reader_phone_no"
                  name="reader_phone_no"
                  type="tel"
                  required
                  value={formData.reader_phone_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label
                htmlFor="reader_address"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Address
              </label>
              <textarea
                id="reader_address"
                name="reader_address"
                rows={3}
                required
                value={formData.reader_address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                placeholder="Enter your address"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring pr-10 transition-all duration-200"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md shadow-sm placeholder:text-input-placeholder text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring pr-10 transition-all duration-200"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted p-4 rounded-lg border border-border">
              <p className="text-sm text-foreground mb-2">
                Password must contain:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
                <li>• One special character</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 shadow hover:shadow-md"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
