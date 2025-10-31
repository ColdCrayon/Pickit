import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TicketForm, AdminGuard, UsersRoleTable } from "../components";
import { useUserPlan } from "../hooks";
// If you want the helper styles, import once (optional):
import "../styles/admin.css";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useUserPlan();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/account");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isAdmin, loading, navigate]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="page admin-page">
      <h1 className="page__title">Admin Dashboard</h1>
      <AdminGuard>
        <TicketForm />
        <UsersRoleTable />
      </AdminGuard>
    </div>
  );
}
