import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export interface BillingSummaryTotals {
  monthToDate?: number;
  lastThreeMonths?: number;
  lifetime?: number;
}

export interface BillingSummary {
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  status: string;
  startedAt?: string | null;
  currentPeriodEnd?: string | null;
  cancelAt?: string | null;
  totals?: BillingSummaryTotals;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber?: string;
  description?: string;
  amountPaid: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  pdfUrl?: string;
  createdAt?: unknown;
}

export interface PaymentMethodDetails {
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  funding?: string;
  isDefault?: boolean;
  billingName?: string;
}

export interface PaymentMethodResponse {
  paymentMethod: PaymentMethodDetails | null;
  billingPortalUrl?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  status?: string;
  cancelAt?: string | null;
}

type CallableResponse<T> = T | { data: T } | { result: T } | { payload: T };

type BillingSummaryCallableResponse =
  | CallableResponse<BillingSummary>
  | { summary: BillingSummary }
  | { billingSummary: BillingSummary };

type BillingInvoicesCallableResponse =
  | CallableResponse<BillingInvoice[]>
  | { invoices: BillingInvoice[] }
  | { data: { invoices: BillingInvoice[] } };

type PaymentMethodCallableResponse =
  | CallableResponse<PaymentMethodResponse>
  | { paymentMethod: PaymentMethodDetails | null }
  | { billingPortalUrl?: string };

type CancelSubscriptionCallableResponse = CallableResponse<CancelSubscriptionResponse>;

const callFunction = <Request, Response>(name: string) =>
  httpsCallable<Request, Response>(functions, name);

const normalizeTotals = (rawTotals: any): BillingSummaryTotals | undefined => {
  if (!rawTotals || typeof rawTotals !== "object") {
    return undefined;
  }

  const totals = rawTotals as Record<string, unknown>;

  const pickNumber = (keys: string[]): number | undefined => {
    for (const key of keys) {
      const value = totals[key];
      if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
      }
      if (typeof value === "string") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  };

  const monthToDate = pickNumber(["monthToDate", "thisMonth", "currentMonth"]);
  const lastThreeMonths = pickNumber([
    "lastThreeMonths",
    "last90Days",
    "quarterToDate",
  ]);
  const lifetime = pickNumber(["lifetime", "lifetimeTotal", "allTime", "total"]);

  if (monthToDate === undefined && lastThreeMonths === undefined && lifetime === undefined) {
    return undefined;
  }

  return { monthToDate, lastThreeMonths, lifetime };
};

const normalizeBillingSummary = (payload: BillingSummaryCallableResponse): BillingSummary => {
  const raw: any =
    payload && typeof payload === "object" && "summary" in payload
      ? (payload as { summary: BillingSummary }).summary
      : payload && typeof payload === "object" && "billingSummary" in payload
      ? (payload as { billingSummary: BillingSummary }).billingSummary
      : payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: BillingSummary }).data
      : payload && typeof payload === "object" && "result" in payload
      ? (payload as { result: BillingSummary }).result
      : payload && typeof payload === "object" && "payload" in payload
      ? (payload as { payload: BillingSummary }).payload
      : payload;

  const planName = raw?.planName ?? raw?.plan ?? raw?.plan_name ?? "Premium Plan";
  const amountValue = raw?.amount ?? raw?.price ?? raw?.planAmount;
  const parsedAmount =
    typeof amountValue === "number"
      ? amountValue
      : typeof amountValue === "string"
      ? Number(amountValue)
      : undefined;
  const currency = (raw?.currency ?? raw?.planCurrency ?? "USD") as string;
  const interval = (raw?.interval ?? raw?.billingInterval ?? "month") as string;
  const status = (raw?.status ?? raw?.subscriptionStatus ?? "inactive") as string;
  const startedAt = raw?.startedAt ?? raw?.startDate ?? raw?.activatedAt ?? null;
  const currentPeriodEnd =
    raw?.currentPeriodEnd ??
    raw?.currentPeriodEndAt ??
    raw?.nextBillingDate ??
    raw?.currentPeriodEndDate ??
    null;
  const cancelAt = raw?.cancelAt ?? raw?.cancelAtPeriodEnd ?? raw?.canceledAt ?? null;

  const totals =
    normalizeTotals(raw?.totals) ??
    normalizeTotals(raw?.metrics) ??
    normalizeTotals(raw?.summaryTotals) ??
    normalizeTotals(raw?.totalsSummary);

  return {
    planName,
    amount: parsedAmount ?? 0,
    currency,
    interval,
    status,
    startedAt: startedAt ?? null,
    currentPeriodEnd: currentPeriodEnd ?? null,
    cancelAt: cancelAt ?? null,
    totals,
  };
};

const normalizeInvoice = (invoice: any): BillingInvoice | null => {
  if (!invoice) {
    return null;
  }

  const id =
    invoice.id ??
    invoice.invoiceId ??
    invoice.invoice_id ??
    invoice.number ??
    invoice.invoiceNumber ??
    invoice.uid;
  if (!id) {
    return null;
  }

  const amountValue =
    invoice.amountPaid ??
    invoice.amount ??
    invoice.total ??
    invoice.subtotal ??
    invoice.amount_due;
  const amountPaid =
    typeof amountValue === "number"
      ? amountValue
      : typeof amountValue === "string"
      ? Number(amountValue)
      : 0;

  const currency = (invoice.currency ?? "USD") as string;
  const status = (invoice.status ?? invoice.paymentStatus ?? "unknown") as string;
  const pdfUrl =
    invoice.pdfUrl ??
    invoice.invoicePdf ??
    invoice.invoice_pdf ??
    invoice.invoice_pdf_url ??
    invoice.hostedInvoicePdf ??
    undefined;
  const hostedInvoiceUrl =
    invoice.hostedInvoiceUrl ??
    invoice.invoiceUrl ??
    invoice.url ??
    invoice.hosted_invoice_url ??
    undefined;

  return {
    id: String(id),
    invoiceNumber: invoice.invoiceNumber ?? invoice.number ?? undefined,
    description:
      invoice.description ?? invoice.planName ?? invoice.plan ?? invoice.productName ?? undefined,
    amountPaid: Number.isFinite(amountPaid) ? amountPaid : 0,
    currency: currency.toUpperCase(),
    status,
    hostedInvoiceUrl,
    pdfUrl,
    createdAt:
      invoice.createdAt ??
      invoice.created ??
      invoice.date ??
      invoice.created_at ??
      invoice.invoiceDate ??
      undefined,
  };
};

const normalizeInvoices = (
  payload: BillingInvoicesCallableResponse
): BillingInvoice[] => {
  const raw: any =
    payload && typeof payload === "object" && "invoices" in payload
      ? (payload as { invoices: BillingInvoice[] }).invoices
      : payload && typeof payload === "object" && "data" in payload &&
        Array.isArray((payload as { data: { invoices: BillingInvoice[] } }).data?.invoices)
      ? (payload as { data: { invoices: BillingInvoice[] } }).data.invoices
      : payload && typeof payload === "object" && "result" in payload
      ? (payload as { result: BillingInvoice[] }).result
      : payload && typeof payload === "object" && "payload" in payload
      ? (payload as { payload: BillingInvoice[] }).payload
      : payload;

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((invoice) => normalizeInvoice(invoice))
    .filter((invoice): invoice is BillingInvoice => Boolean(invoice));
};

const normalizePaymentMethod = (
  payload: PaymentMethodCallableResponse
): PaymentMethodResponse => {
  const raw: any =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: PaymentMethodResponse }).data
      : payload && typeof payload === "object" && "result" in payload
      ? (payload as { result: PaymentMethodResponse }).result
      : payload && typeof payload === "object" && "payload" in payload
      ? (payload as { payload: PaymentMethodResponse }).payload
      : payload;

  const paymentMethodRaw =
    raw?.paymentMethod ?? raw?.defaultPaymentMethod ?? raw?.data?.paymentMethod ?? raw;

  const billingPortalUrl =
    raw?.billingPortalUrl ??
    raw?.portalUrl ??
    raw?.manageUrl ??
    raw?.updatePaymentMethodUrl ??
    raw?.billingPortal?.url ??
    undefined;

  const paymentMethod: PaymentMethodDetails | null = paymentMethodRaw
    ? {
        brand:
          paymentMethodRaw.brand ??
          paymentMethodRaw.card?.brand ??
          paymentMethodRaw.cardBrand ??
          undefined,
        last4:
          paymentMethodRaw.last4 ??
          paymentMethodRaw.card?.last4 ??
          paymentMethodRaw.cardLast4 ??
          undefined,
        expMonth:
          paymentMethodRaw.expMonth ??
          paymentMethodRaw.card?.exp_month ??
          paymentMethodRaw.exp_month ??
          undefined,
        expYear:
          paymentMethodRaw.expYear ??
          paymentMethodRaw.card?.exp_year ??
          paymentMethodRaw.exp_year ??
          undefined,
        funding:
          paymentMethodRaw.funding ??
          paymentMethodRaw.card?.funding ??
          undefined,
        isDefault:
          paymentMethodRaw.isDefault ??
          paymentMethodRaw.default ??
          paymentMethodRaw.default_payment_method ??
          true,
        billingName:
          paymentMethodRaw.billingName ??
          paymentMethodRaw.billing_details?.name ??
          paymentMethodRaw.billingDetails?.name ??
          undefined,
      }
    : null;

  return {
    paymentMethod,
    billingPortalUrl,
  };
};

const normalizeCancelSubscription = (
  payload: CancelSubscriptionCallableResponse
): CancelSubscriptionResponse => {
  const raw: any =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: CancelSubscriptionResponse }).data
      : payload && typeof payload === "object" && "result" in payload
      ? (payload as { result: CancelSubscriptionResponse }).result
      : payload && typeof payload === "object" && "payload" in payload
      ? (payload as { payload: CancelSubscriptionResponse }).payload
      : payload;

  return {
    success: Boolean(raw?.success ?? raw?.ok ?? raw?.status === "success"),
    message: raw?.message ?? raw?.statusMessage ?? undefined,
    status: raw?.status ?? raw?.subscriptionStatus ?? undefined,
    cancelAt: raw?.cancelAt ?? raw?.cancel_at ?? raw?.canceledAt ?? null,
  };
};

export const getBillingSummary = async (): Promise<BillingSummary> => {
  const callable = callFunction<void, BillingSummaryCallableResponse>("getBillingSummary");
  const result = await callable();
  return normalizeBillingSummary(result.data ?? result);
};

export const listInvoices = async (): Promise<BillingInvoice[]> => {
  const callable = callFunction<void, BillingInvoicesCallableResponse>("listInvoices");
  const result = await callable();
  return normalizeInvoices(result.data ?? result);
};

export const getPaymentMethod = async (): Promise<PaymentMethodResponse> => {
  const callable = callFunction<void, PaymentMethodCallableResponse>("getPaymentMethod");
  const result = await callable();
  return normalizePaymentMethod(result.data ?? result);
};

export const cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
  const callable = callFunction<void, CancelSubscriptionCallableResponse>("cancelSubscription");
  const result = await callable();
  return normalizeCancelSubscription(result.data ?? result);
};
