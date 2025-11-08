import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserPlan } from "../hooks";
import {
  CreditCard,
  Calendar,
  Download,
  Settings,
  Crown,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";

/**
 * Billing Page Component
 * Displays subscription details, payment methods, and transaction history
 * Route: /billing
 */
const Billing: React.FC = () => {
  const { isPremium, loading: userPlanLoading } = useUserPlan();
  const [cancelConfirm, setCancelConfirm] = useState(false);

  // Mock data - Replace with real data from Firebase/Stripe later
  const mockTransactions = [
    {
      id: "inv_001",
      date: "Nov 7, 2024",
      description: "Premium Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      invoice: "INV-2024-11-001",
    },
    {
      id: "inv_002",
      date: "Oct 7, 2024",
      description: "Premium Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      invoice: "INV-2024-10-001",
    },
    {
      id: "inv_003",
      date: "Sep 7, 2024",
      description: "Premium Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      invoice: "INV-2024-09-001",
    },
    {
      id: "inv_004",
      date: "Aug 7, 2024",
      description: "Premium Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      invoice: "INV-2024-08-001",
    },
    {
      id: "inv_005",
      date: "Jul 7, 2024",
      description: "Premium Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      invoice: "INV-2024-07-001",
    },
  ];

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement actual invoice download
    console.log("Downloading invoice:", invoiceId);
    alert(`Invoice ${invoiceId} download will be implemented soon!`);
  };

  const handleCancelSubscription = () => {
    // TODO: Implement actual cancellation logic
    console.log("Canceling subscription...");
    alert("Subscription cancellation will be implemented with Stripe integration!");
  };

  const handleUpdatePaymentMethod = () => {
    // TODO: Implement payment method update
    console.log("Updating payment method...");
    alert("Payment method update will be implemented with Stripe integration!");
  };

  if (userPlanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // If user is not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
          }}
        />

        <main className="relative z-10 max-w-4xl mx-auto flex-1 py-28 px-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">No Active Subscription</h1>
            <p className="text-gray-400 mb-8">
              You don't have an active premium subscription. Upgrade now to access
              premium features and manage your billing.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/upgrade"
                className="px-6 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 transition"
              >
                Upgrade to Premium
              </Link>
              <Link
                to="/account"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                Back to Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto flex-1 py-28 px-6 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold">Billing & Payments</h1>
          <p className="text-gray-400 mt-2">
            Manage your subscription, payment methods, and view transaction history
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Subscription Card */}
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Current Subscription
                </h2>
                <p className="text-gray-400">Premium Plan - Monthly</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-400">$19.99</p>
                <p className="text-sm text-gray-400">per month</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Started</span>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Next Billing Date</span>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-green-400 bg-green-500/10 rounded-xl p-4 border border-green-500/30">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Subscription Active</span>
            </div>
          </Card>

          {/* Payment Method Card */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-yellow-400" />
                Payment Method
              </h2>
              <button
                onClick={handleUpdatePaymentMethod}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Update
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                    VISA
                  </div>
                  <div>
                    <p className="font-semibold text-lg">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-400">Expires 12/25</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                    Default
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction History Card */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-yellow-400" />
                Transaction History
              </h2>
              <div className="text-sm text-gray-400">
                Showing last {mockTransactions.length} transactions
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                      Description
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                      Invoice
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                      Amount
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                      Status
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium">{transaction.date}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300">{transaction.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-400 font-mono">
                          {transaction.invoice}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-semibold">{transaction.amount}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                          <CheckCircle className="w-3 h-3" />
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(transaction.invoice)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold mb-1">{transaction.date}</p>
                      <p className="text-sm text-gray-400">{transaction.description}</p>
                    </div>
                    <p className="font-bold text-lg">{transaction.amount}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                      <CheckCircle className="w-3 h-3" />
                      {transaction.status}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(transaction.invoice)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="mt-6 text-center">
              <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-sm">
                Load More Transactions
              </button>
            </div>
          </Card>

          {/* Billing Summary Card */}
          <Card>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              Billing Summary
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">This Month</p>
                <p className="text-2xl font-bold text-yellow-400">$19.99</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Last 3 Months</p>
                <p className="text-2xl font-bold">$59.97</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Total Lifetime</p>
                <p className="text-2xl font-bold">$99.95</p>
              </div>
            </div>
          </Card>

          {/* Cancel Subscription Card */}
          <Card>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <h3 className="font-semibold mb-2 text-red-400 text-xl">
                Cancel Subscription
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                You'll lose access to all premium features at the end of your current
                billing period ({new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}).
              </p>
              {!cancelConfirm ? (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition font-medium"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-sm text-yellow-400 font-medium">
                      ⚠️ Are you sure? This action will cancel your subscription.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition font-medium"
                    >
                      Yes, Cancel My Subscription
                    </button>
                    <button
                      onClick={() => setCancelConfirm(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition"
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Reusable Card Component
const Card: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
    {children}
  </div>
);

export default Billing;