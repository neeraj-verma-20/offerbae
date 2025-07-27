"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminPanel from "./AdminPanel";

export default function AdminPageWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading while checking session
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-semibold text-red-600 mb-4">🚫 Unauthorized Access</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to view this page. Please log in to{" "}
            <span 
              onClick={() => window.location.href = '/admin-secret'}
              className="cursor-pointer"
              title="Admin Access"
            >
              continue
            </span>.
          </p>
        </div>
      </main>
    );
  }

  return <AdminPanel />;
}
