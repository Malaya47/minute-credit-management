"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
  //     const response = await axios.post(`http://localhost:8000${endpoint}`, {
  //       email,
  //       password,
  //     });

  //     localStorage.setItem("token", response.data.token);
  //     localStorage.setItem("user", JSON.stringify(response.data.user));
  //     router.push("/dashboard");
  //   } catch (err: any) {
  //     setError(err.response?.data?.error || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await axios.post(`http://localhost:8000${endpoint}`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      // Store user data with correct credits
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    //   <div className="max-w-md w-full space-y-8">
    //     <div>
    //       <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //         {isLogin ? "Sign in to your account" : "Create a new account"}
    //       </h2>
    //     </div>
    //     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
    //       {error && (
    //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
    //           {error}
    //         </div>
    //       )}
    //       <div className="rounded-md shadow-sm -space-y-px">
    //         <div>
    //           <label htmlFor="email-address" className="sr-only">
    //             Email address
    //           </label>
    //           <input
    //             id="email-address"
    //             name="email"
    //             type="email"
    //             autoComplete="email"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="Email address"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //           />
    //         </div>
    //         <div>
    //           <label htmlFor="password" className="sr-only">
    //             Password
    //           </label>
    //           <input
    //             id="password"
    //             name="password"
    //             type="password"
    //             autoComplete="current-password"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="Password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //           />
    //         </div>
    //       </div>

    //       <div>
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    //         >
    //           {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
    //         </button>
    //       </div>

    //       <div className="text-center">
    //         <button
    //           type="button"
    //           className="text-indigo-600 hover:text-indigo-500"
    //           onClick={() => setIsLogin(!isLogin)}
    //         >
    //           {isLogin
    //             ? "Need an account? Sign up"
    //             : "Already have an account? Sign in"}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Sign in" : "Create an account"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin
              ? "Enter your credentials to continue"
              : "Fill in the details below to get started"}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-3 text-center">
            <label
              htmlFor="email-address"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mx-auto block w-72 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-3 text-center">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mx-auto block w-72 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="mx-auto block w-72 py-3 px-4 text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md disabled:opacity-60 transition mt-4"
            >
              {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        {/* Toggle login/signup */}
        <div className="text-center pt-4">
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
