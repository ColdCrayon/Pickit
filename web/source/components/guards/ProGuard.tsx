import React from "react";
import { Navigate } from "react-router-dom";
import { useUserPlan } from "../../hooks";

interface ProGuardProps {
  children: React.ReactNode;
}

/**
 * ProGuard - Route guard for premium/pro users only
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProGuard><ProDashboard /></ProGuard>} />
 *
 * Redirects to /upgrade if user is not premium
 */
export const ProGuard: React.FC<ProGuardProps> = ({ children }) => {
  const { isPremium, loading } = useUserPlan();

  // Show loading state while checking user plan
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect non-premium users to upgrade page
  if (!isPremium) {
    return <Navigate to="/upgrade" replace />;
  }

  // Render protected content for premium users
  return <>{children}</>;
};

export default ProGuard;
