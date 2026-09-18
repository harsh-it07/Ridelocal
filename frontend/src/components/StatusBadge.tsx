// Glass-styled status badges for the warm dark gradient background.
// Each status maps to a translucent glass color pairing.
const COLORS: Record<string, string> = {
  VERIFIED: "glass-badge-green",
  ACTIVE: "glass-badge-green",
  CONFIRMED: "glass-badge-green",
  COMPLETED: "glass-badge-blue",
  PENDING: "glass-badge-amber",
  PENDING_REVIEW: "glass-badge-amber",
  PENDING_PAYMENT: "glass-badge-amber",
  UNDER_REVIEW: "glass-badge-amber",
  REFUND_PENDING: "glass-badge-amber",
  UNVERIFIED: "glass-badge-neutral",
  DRAFT: "glass-badge-neutral",
  REJECTED: "glass-badge-red",
  PAYMENT_FAILED: "glass-badge-red",
  DISPUTED: "glass-badge-red",
  SUSPENDED: "glass-badge-red",
  CANCELLED: "glass-badge-neutral",
  REFUNDED: "glass-badge-blue",
  EXPIRED: "glass-badge-neutral",
  PAID: "glass-badge-green",
  PROCESSING: "glass-badge-amber",
  FAILED: "glass-badge-red",
  OPEN: "glass-badge-amber",
  RESOLVED: "glass-badge-green",
  CLOSED: "glass-badge-neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = COLORS[status] || "glass-badge-neutral";
  return (
    <span
      className="badge"
      style={BADGE_STYLES[cls] || BADGE_STYLES["glass-badge-neutral"]}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  "glass-badge-green": {
    background: "rgba(34, 197, 94, 0.12)",
    color: "#4ade80",
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  "glass-badge-blue": {
    background: "rgba(59, 130, 246, 0.12)",
    color: "#60a5fa",
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  "glass-badge-amber": {
    background: "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    borderColor: "rgba(245, 158, 11, 0.15)",
  },
  "glass-badge-red": {
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  "glass-badge-neutral": {
    background: "rgba(255, 255, 255, 0.06)",
    color: "rgba(255, 255, 255, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
};
