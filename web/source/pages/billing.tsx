import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks";
import { redirectToCustomerPortal, redirectToCheckout } from "../lib/stripe";
import { db, functions } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
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
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/utils";

/**
 * Billing Page Component
 * Displays subscription details, payment methods, and transaction history
 * Route: /billing
 */
const Billing: React.FC = () => {
  const { user, isPremium, loading: userPlanLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [billingDetails, setBillingDetails] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      // 1. Get User Data (Subscription Status)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      setSubscriptionData(userData);

      // 2. Get Billing Details (Invoices, Payment Methods)
      console.log("Calling getBillingDetails...");
      const getBillingDetails = httpsCallable(functions, 'getBillingDetails');
      const result = await getBillingDetails();
      console.log("getBillingDetails result:", result);
      setBillingDetails(result.data);

    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDownloadInvoice = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      await redirectToCustomerPortal();
    } catch (error) {
      console.error("Error opening portal:", error);
      alert("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await redirectToCheckout(user.email, user.displayName || undefined);
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Failed to start checkout process");
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (userPlanLoading || (isPremium && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // If user is not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <main className="relative z-10 max-w-4xl mx-auto flex-1 py-28 px-6 flex flex-col items-center justify-center text-center">
          <div className="mb-8 p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            No Active Subscription
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            You don't have an active premium subscription. Upgrade now to access
            premium features, arbitrage opportunities, and manage your billing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <Button
              variant="liquid"
              size="lg"
              className="w-full text-lg h-12"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Crown className="mr-2 h-5 w-5" />}
              Upgrade to Premium
            </Button>
            <Button variant="outline" size="lg" className="w-full text-lg h-12" asChild>
              <Link to="/account">Back to Account</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const invoices = billingDetails?.invoices || [];
  const upcomingInvoice = billingDetails?.upcomingInvoice;
  const paymentMethod = billingDetails?.paymentMethod;

  // Calculate totals
  const thisMonthTotal = invoices
    .filter((inv: any) => {
      const invDate = new Date(inv.date * 1000);
      const now = new Date();
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, inv: any) => sum + inv.amount, 0);

  const last3MonthsTotal = invoices
    .filter((inv: any) => {
      const invDate = new Date(inv.date * 1000);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return invDate > threeMonthsAgo;
    })
    .reduce((sum: number, inv: any) => sum + inv.amount, 0);

  const lifetimeTotal = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      <main className="relative z-10 max-w-6xl mx-auto flex-1 py-12 px-6 w-full">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" asChild>
            <Link to="/account">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Account
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Billing & Payments</h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription, payment methods, and view transaction history
          </p>
        </div>

        <div className="space-y-8">
          {/* Current Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {subscriptionData?.priceNickname || "Premium Plan"}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {upcomingInvoice && (
                    <>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(upcomingInvoice.amount, upcomingInvoice.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Started</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {subscriptionData?.premiumUpdatedAt?.seconds
                      ? formatDate(subscriptionData.premiumUpdatedAt.seconds)
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Next Billing Date</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {upcomingInvoice
                      ? formatDate(upcomingInvoice.date)
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-green-500 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Subscription Active</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button
                variant="liquid"
                onClick={handleManageSubscription}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                Manage Subscription
              </Button>
            </CardFooter>
          </Card>

          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Payment Method
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethod ? (
                <div className="bg-secondary/50 rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md uppercase">
                        {paymentMethod.brand}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">•••• •••• •••• {paymentMethod.last4}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Default</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  No payment method found.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button
                variant="ghost"
                onClick={handleManageSubscription}
                disabled={loading}
              >
                Update Payment Method
              </Button>
            </CardFooter>
          </Card>

          {/* Transaction History Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Transaction History
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing last {invoices.length} transactions
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                            Date
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                            Description
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                            Invoice
                          </th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                            Status
                          </th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice: any) => (
                          <tr
                            key={invoice.id}
                            className="border-b border-border hover:bg-muted/50 transition"
                          >
                            <td className="py-4 px-4">
                              <p className="font-medium">{formatDate(invoice.date)}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-muted-foreground">{invoice.description}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-muted-foreground font-mono">
                                {invoice.number}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-semibold">
                                {formatCurrency(invoice.amount, invoice.currency)}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Badge variant="success" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 capitalize">
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice.pdfUrl)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {invoices.map((invoice: any) => (
                      <div
                        key={invoice.id}
                        className="bg-secondary/50 rounded-xl p-4 border border-border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold mb-1">{formatDate(invoice.date)}</p>
                            <p className="text-sm text-muted-foreground">{invoice.description}</p>
                          </div>
                          <p className="font-bold text-lg">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <Badge variant="success" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 capitalize">
                            {invoice.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.pdfUrl)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transaction history found.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center pt-6">
              {/* Pagination could go here */}
            </CardFooter>
          </Card>

          {/* Billing Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Billing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">This Month</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(thisMonthTotal, 'usd')}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Last 3 Months</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(last3MonthsTotal, 'usd')}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Total Lifetime</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(lifetimeTotal, 'usd')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Billing;