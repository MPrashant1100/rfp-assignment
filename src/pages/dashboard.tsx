import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import NavBar from "@/components/NavBar";
import Link from "next/link";

const DashboardPage: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (!decoded.role) throw new Error();
      setRole(decoded.role);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const links =
    role === "Buyer"
      ? [
          { href: "/create-rfp", label: "Create RFP" },
          { href: "/my-rfps", label: "My RFPs" },
          { href: "/review-responses", label: "Review Responses" },
        ]
      : [
          { href: "/browse-rfps", label: "Browse RFPs" },
          { href: "/my-responses", label: "My Responses" },
        ];

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar links={[{ href: "/", label: "Dashboard" }, ...links]} />
      <div className="p-4 flex justify-end">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome, {role}</h2>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-blue-600 hover:underline ${
                  router.pathname === link.href ? "font-bold underline" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => (
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
);

export default Dashboard;
