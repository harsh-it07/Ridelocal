import { Link } from "react-router-dom";

const LINKS = [
  { to: "/admin/verifications", label: "Verification queue", icon: "🪪" },
  { to: "/admin/vehicles", label: "Vehicle approvals", icon: "🛵" },
  { to: "/admin/users", label: "User management", icon: "👥" },
  { to: "/admin/bookings", label: "Booking monitoring", icon: "📅" },
  { to: "/admin/payments", label: "Payment monitoring", icon: "💳" },
  { to: "/admin/disputes", label: "Disputes & refunds", icon: "⚖️" },
];

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Moderate users, vehicles, bookings, and payments.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card p-6 hover:shadow-md">
            <div className="text-2xl">{l.icon}</div>
            <p className="mt-2 font-semibold text-ink-900">{l.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
