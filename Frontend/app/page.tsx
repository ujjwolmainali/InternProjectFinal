"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/app/lib/axios";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    try {
      //  Check access token
      await api.get("/auth/tokenData", { withCredentials: true });

      router.replace("/cp/dashboard");
      return;
    } catch {
      try {
        //  Try refresh token
        await api.post("/auth/refresh-token", {}, { withCredentials: true });

        router.replace("/cp/dashboard");
        return;
      } catch (err: any) {
        //  Refresh FAILED → show login
        if (err?.response?.status === 401) {
          setCheckingAuth(false);
          return;
        }

        // safety fallback
        setCheckingAuth(false);
      }
    }
  };

  checkAuth();
}, [router]);



if (checkingAuth) {
  return <div className="min-h-screen flex items-center justify-center">
    Loading...
  </div>;
}



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await api.post(
      "auth/login",
      { email, password },
      { withCredentials: true } // ensures cookies are sent/received
    );

    // Success toast
    toast.success(response.data.message || "Login successful!");

    // Save login status
    localStorage.setItem("login", "true");

    // Redirect to dashboard (or any protected route)
    router.push("cp/dashboard");
  } catch (error: any) {
    // Error toast
    const msg = error.response?.data?.message || "Login failed. Please try again.";
    toast.error(msg);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-linear-to-br from-blue-600 to-purple-600 px-8 py-10 text-white">
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Lock size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
            <p className="text-blue-100 text-center mt-2">Sign in to your account</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;