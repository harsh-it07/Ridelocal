const COLORS: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-800",
  ACTIVE: "bg-green-100 text-green-800",
  CONFIRMED: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  PENDING: "bg-amber-100 text-amber-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  REFUND_PENDING: "bg-amber-100 text-amber-800",
  UNVERIFIED: "bg-neutral-100 text-neutral-700",
  DRAFT: "bg-neutral-100 text-neutral-700",
  REJECTED: "bg-red-100 text-red-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-red-100 text-red-800",
  CANCELLED: "bg-neutral-200 text-neutral-700",
  REFUNDED: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-neutral-200 text-neutral-700",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  OPEN: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-neutral-200 text-neutral-700",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = COLORS[status] || "bg-neutral-100 text-neutral-700";
  return <span className={`badge ${cls}`}>{status.replace(/_/g, " ")}</span>;
}
