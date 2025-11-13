import React, { useCallback, useEffect, useState } from "react";
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
import {
  getBillingSummary,
  listInvoices,
  getPaymentMethod,
  cancelSubscription as cancelSubscriptionApi,
  BillingSummary,
  BillingInvoice,
  PaymentMethodDetails,
} from "../lib/billing";
import { formatDate, getSafeErrorMessage, logError } from "../lib";

type ToastState = {
  type: "success" | "error";
  message: string;
};

const isBrowser = typeof window !== "undefined";

const formatCurrency = (value?: number, currency: string = "USD"): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch (error) {
    logError(error, "Billing.formatCurrency");
    return `$${value.toFixed(2)}`;
  }
};

const formatStatus = (status?: string): string => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const isActiveStatus = (status?: string): boolean => {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return ["active", "trialing", "past_due", "incomplete"].includes(normalized);
};

const toTimestamp = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "number") {
    return value > 1e12 ? value : value * 1000;
  }
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object") {
    const record = value as Record<string, any>;
    if (typeof record.seconds === "number") {
      return record.seconds * 1000;
    }
    if (record instanceof Date) {
      return record.getTime();
    }
  }
  return 0;
};

const openInNewTab = (url?: string | null): boolean => {
  if (!url || !isBrowser) {
    return false;
  }
  window.open(url, "_blank", "noopener");
  return true;
};

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mb-4" />
    <p>{message}</p>
  </div>
);

/**
 * Billing Page Component
 * Displays subscription details, payment methods, and transaction history
 * Route: /billing
 */
const Billing: React.FC = () => {
  const { isPremium, loading: userPlanLoading } = useUserPlan();
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDetails | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [actionLoading, setActionLoading] = useState({
    cancel: false,
    updatePayment: false,
  });

  const loadBillingData = useCallback(async () => {
    if (!isPremium) {
      setSummary(null);
      setInvoices([]);
      setPaymentMethod(null);
      
      setBillingLoading(false);
      return;
    }

    setBillingLoading(true);
    setLoadError(null);
    setActionError(null);

    try {
      const [summaryData, invoiceData, paymentData] = await Promise.all([
        getBillingSummary(),
        listInvoices(),
        getPaymentMethod(),
      ]);

      const sortedInvoices = [...invoiceData].sort(
        (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
      );

      setSummary(summaryData);
      setInvoices(sortedInvoices);
      setPaymentMethod(paymentData.paymentMethod);
    } catch (error) {
      logError(error, "Billing.loadData");
      setLoadError(
        getSafeErrorMessage(error, "Unable to load billing information. Please try again.")
      );
    } finally {
      setBillingLoading(false);
    }
  }, [isPremium]);

  useEffect(() => {
    if (!userPlanLoading) {
      if (isPremium) {
        loadBillingData();
      } else {
        setSummary(null);
        setInvoices([]);
        setPaymentMethod(null);
        setBillingLoading(false);
        setLoadError(null);
        setActionError(null);
      }
    }
  }, [isPremium, userPlanLoading, loadBillingData]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleDownloadInvoice = (invoice: BillingInvoice) => {
    const downloadUrl = invoice.pdfUrl ?? invoice.hostedInvoiceUrl;
    if (openInNewTab(downloadUrl)) {
      setToast({ type: "success", message: "Opening invoice in a new tab." });
      return;
    }

    setActionError("Invoice download link is unavailable right now.");
  };

  const handleCancelSubscription = async () => {
    setActionError(null);
    setActionLoading((prev) => ({ ...prev, cancel: true }));
    try {
      const response = await cancelSubscriptionApi();
      if (!response.success) {
        throw new Error(response.message || "Unable to cancel subscription.");
      }
      setToast({
        type: "success",
        message: response.message || "Subscription cancellation requested successfully.",
      });
      setCancelConfirm(false);
      await loadBillingData();
    } catch (error) {
      logError(error, "Billing.cancelSubscription");
      setActionError(
        getSafeErrorMessage(error, "Failed to cancel subscription. Please try again.")
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, cancel: false }));
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setActionError(null);
    setActionLoading((prev) => ({ ...prev, updatePayment: true }));
    try {
      const data = await getPaymentMethod();
      setPaymentMethod(data.paymentMethod);

      if (openInNewTab(data.billingPortalUrl)) {
        setToast({ type: "success", message: "Opening Stripe billing portal." });
      } else {
        setActionError("No billing portal link is available right now. Please try again later.");
      }
    } catch (error) {
      logError(error, "Billing.updatePaymentMethod");
      setActionError(
        getSafeErrorMessage(error, "Failed to open billing portal. Please try again.")
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, updatePayment: false }));
    }
  };

  if (userPlanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingState message="Loading billing information..." />
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

  const status = summary?.status ?? "inactive";
  const statusIsActive = isActiveStatus(status);
  const StatusIcon = statusIsActive ? CheckCircle : AlertCircle;
  const statusClasses = statusIsActive
    ? "text-green-400 bg-green-500/10 border-green-500/30"
    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";

  const totals = [
    { label: "This Month", value: summary?.totals?.monthToDate },
    { label: "Last 3 Months", value: summary?.totals?.lastThreeMonths },
    { label: "Total Lifetime", value: summary?.totals?.lifetime },
  ];

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

        {toast && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 flex items-start gap-3 ${
              toast.type === "success"
                ? "border-green-500/40 bg-green-500/10 text-green-200"
                : "border-red-500/40 bg-red-500/10 text-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <span className="text-sm font-medium">{loadError}</span>
              </div>
              <button
                onClick={loadBillingData}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-medium transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {actionError && !loadError && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span className="text-sm font-medium">{actionError}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Current Subscription Card */}
          <Card>
            {billingLoading && !summary ? (
              <LoadingState message="Loading subscription details..." />
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      Current Subscription
                    </h2>
                    <p className="text-gray-400">{summary?.planName ?? "Premium Plan"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-yellow-400">
                      {summary ? formatCurrency(summary.amount, summary.currency) : "—"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {summary?.interval
                        ? `per ${summary.interval.toLowerCase()}`
                        : "per month"}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Started</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {summary?.startedAt ? formatDate(summary.startedAt) : "—"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Next Billing Date</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {summary?.currentPeriodEnd ? formatDate(summary.currentPeriodEnd) : "—"}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-6 flex items-center gap-2 rounded-xl p-4 border ${statusClasses}`}
                >
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-medium">{formatStatus(status)}</span>
                </div>
              </>
            )}
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
                disabled={actionLoading.updatePayment}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4" />
                {actionLoading.updatePayment ? "Opening..." : "Update"}
              </button>
            </div>

            {billingLoading && !paymentMethod ? (
              <LoadingState message="Loading payment method..." />
            ) : paymentMethod ? (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white uppercase">
                      {paymentMethod.brand ?? "CARD"}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {paymentMethod.last4 ? `•••• •••• •••• ${paymentMethod.last4}` : "Card on file"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {paymentMethod.expMonth && paymentMethod.expYear
                          ? `Expires ${paymentMethod.expMonth.toString().padStart(2, "0")}/${
                              paymentMethod.expYear
                            }`
                          : "Expiration unknown"}
                      </p>
                      {paymentMethod.billingName && (
                        <p className="text-xs text-gray-500 mt-1">
                          {paymentMethod.billingName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30">
                      <CheckCircle className="w-4 h-4" />
                      {paymentMethod.isDefault ? "Default" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-6 border border-dashed border-white/20 text-gray-400 text-sm">
                No payment method on file. Click update to add or manage your payment details.
              </div>
            )}
          </Card>

          {/* Transaction History Card */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-yellow-400" />
                Transaction History
              </h2>
              <div className="text-sm text-gray-400">
                Showing last {invoices.length} transactions
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              {billingLoading && invoices.length === 0 ? (
                <LoadingState message="Loading transactions..." />
              ) : invoices.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  No invoices available yet.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Date</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                        Description
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Invoice</th>
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
                    {invoices.map((invoice) => {
                      const normalizedStatus = (invoice.status || "").toLowerCase();
                      const paid = ["paid", "succeeded"].includes(normalizedStatus);
                      const statusColor = paid
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400";
                      const StatusChipIcon = paid ? CheckCircle : AlertCircle;

                      return (
                        <tr
                          key={invoice.id}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="py-4 px-4">
                            <p className="font-medium">
                              {invoice.createdAt ? formatDate(invoice.createdAt) : "—"}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-300">
                              {invoice.description ?? summary?.planName ?? "Subscription Payment"}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-400 font-mono">
                              {invoice.invoiceNumber ?? invoice.id}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="font-semibold">
                              {formatCurrency(invoice.amountPaid, invoice.currency)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${statusColor}`}
                            >
                              <StatusChipIcon className="w-3 h-3" />
                              {formatStatus(invoice.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {billingLoading && invoices.length === 0 ? (
                <LoadingState message="Loading transactions..." />
              ) : invoices.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  No invoices available yet.
                </div>
              ) : (
                invoices.map((invoice) => {
                  const normalizedStatus = (invoice.status || "").toLowerCase();
                  const paid = ["paid", "succeeded"].includes(normalizedStatus);
                  const statusColor = paid
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400";
                  const StatusChipIcon = paid ? CheckCircle : AlertCircle;

                  return (
                    <div
                      key={invoice.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold mb-1">
                            {invoice.createdAt ? formatDate(invoice.createdAt) : "—"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {invoice.description ?? summary?.planName ?? "Subscription Payment"}
                          </p>
                        </div>
                        <p className="font-bold text-lg">
                          {formatCurrency(invoice.amountPaid, invoice.currency)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${statusColor}`}
                        >
                          <StatusChipIcon className="w-3 h-3" />
                          {formatStatus(invoice.status)}
                        </span>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Refresh Button */}
            <div className="mt-6 text-center">
              <button
                onClick={loadBillingData}
                disabled={billingLoading}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {billingLoading ? "Refreshing..." : "Refresh Transactions"}
              </button>
            </div>
          </Card>

          {/* Billing Summary Card */}
          <Card>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              Billing Summary
            </h2>

            {billingLoading && !summary ? (
              <LoadingState message="Loading billing summary..." />
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {totals.map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">{item.label}</p>
                    <p className="text-2xl font-bold">
                      {item.value != null
                        ? formatCurrency(item.value, summary?.currency ?? "USD")
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Cancel Subscription Card */}
          <Card>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <h3 className="font-semibold mb-2 text-red-400 text-xl">Cancel Subscription</h3>
              <p className="text-sm text-gray-300 mb-4">
                You'll lose access to all premium features at the end of your current billing period
                ({summary?.currentPeriodEnd ? formatDate(summary.currentPeriodEnd) : "—"}).
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
                      disabled={actionLoading.cancel}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading.cancel ? "Canceling..." : "Yes, Cancel My Subscription"}
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

