import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserPlan } from "../../hooks";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useUserPlan();

  if (loading) {
    return <div className="p-6">Checking admin…</div>;
  }

  if (!user) {
    return <Navigate to="/account" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
