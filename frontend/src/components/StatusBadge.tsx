const BADGE_THEMES: Record<string, { bg: string; color: string; border: string }> = {
  VERIFIED: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  ACTIVE: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  CONFIRMED: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  PAID: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  COMPLETED: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  RESOLVED: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  
  PENDING: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },
  PENDING_REVIEW: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },
  PENDING_PAYMENT: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },
  UNDER_REVIEW: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },
  REFUND_PENDING: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },
  PROCESSING: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },
  OPEN: { bg: "rgba(255, 200, 100, 0.1)", color: "#FFD285", border: "rgba(255, 200, 100, 0.3)" },

  REJECTED: { bg: "rgba(255, 80, 80, 0.15)", color: "#FFAAAA", border: "rgba(255, 80, 80, 0.4)" },
  PAYMENT_FAILED: { bg: "rgba(255, 80, 80, 0.15)", color: "#FFAAAA", border: "rgba(255, 80, 80, 0.4)" },
  DISPUTED: { bg: "rgba(255, 80, 80, 0.15)", color: "#FFAAAA", border: "rgba(255, 80, 80, 0.4)" },
  SUSPENDED: { bg: "rgba(255, 80, 80, 0.15)", color: "#FFAAAA", border: "rgba(255, 80, 80, 0.4)" },
  FAILED: { bg: "rgba(255, 80, 80, 0.15)", color: "#FFAAAA", border: "rgba(255, 80, 80, 0.4)" },

  UNVERIFIED: { bg: "rgba(249, 211, 205, 0.08)", color: "#F0C4BC", border: "rgba(249, 211, 205, 0.25)" },
  DRAFT: { bg: "rgba(249, 211, 205, 0.08)", color: "#F0C4BC", border: "rgba(249, 211, 205, 0.25)" },
  CANCELLED: { bg: "rgba(249, 211, 205, 0.08)", color: "#F0C4BC", border: "rgba(249, 211, 205, 0.25)" },
  REFUNDED: { bg: "rgba(249, 211, 205, 0.12)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.4)" },
  EXPIRED: { bg: "rgba(249, 211, 205, 0.08)", color: "#F0C4BC", border: "rgba(249, 211, 205, 0.25)" },
  CLOSED: { bg: "rgba(249, 211, 205, 0.08)", color: "#F0C4BC", border: "rgba(249, 211, 205, 0.25)" },
};

const DEFAULT = { bg: "rgba(249, 211, 205, 0.08)", color: "#F9D3CD", border: "rgba(249, 211, 205, 0.2)" };

export function StatusBadge({ status }: { status: string }) {
  const theme = BADGE_THEMES[status] || DEFAULT;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        fontSize: "0.8125rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: theme.color,
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: 0,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          backgroundColor: theme.color,
          flexShrink: 0,
        }}
      />
      {status.replace(/_/g, " ")}
    </span>
  );
}
