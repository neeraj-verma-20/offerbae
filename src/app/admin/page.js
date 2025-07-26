import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import AdminPanel from "./AdminPanel";

export default async function AdminPageWrapper() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-semibold text-red-600 mb-4">🚫 Unauthorized Access</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to view this page. Please log in to continue.
          </p>
          <a
            href="/admin-secret"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200"
          >
            🔐 Go to Login
          </a>
        </div>
      </main>
    );
  }

  return <AdminPanel />;
}
