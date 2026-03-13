"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "safari55";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthenticated", "true");
      router.push("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#b91c1c] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-stone-800">Admin Login</h1>
          <p className="text-stone-600 mt-2">Enter your password to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none transition text-center"
            />
            {error && (
              <p className="text-red-600 text-sm mt-2 text-center">Incorrect password</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#b91c1c] text-white py-3 px-6 rounded-md font-medium hover:bg-[#991b1b] transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
