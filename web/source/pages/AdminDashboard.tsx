import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TicketForm, AdminGuard, UsersRoleTable } from "../components";
import { useUserPlan } from "../hooks";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

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
      <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
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
    <div className="min-h-screen bg-transparent text-white p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <AdminGuard>
          <div className="grid grid-cols-1 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Create Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketForm />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UsersRoleTable />
              </CardContent>
            </Card>
          </div>
        </AdminGuard>
      </div>
    </div>
  );
}
