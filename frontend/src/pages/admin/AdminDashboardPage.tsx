import { Link } from "react-router-dom";

const LINKS = [
  { to: "/admin/verifications", label: "Verification queue" },
  { to: "/admin/vehicles", label: "Vehicle approvals" },
  { to: "/admin/users", label: "User management" },
  { to: "/admin/bookings", label: "Booking monitoring" },
  { to: "/admin/payments", label: "Payment monitoring" },
  { to: "/admin/disputes", label: "Disputes & refunds" },
];

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Moderate users, vehicles, bookings, and payments.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card p-6 hover:shadow-md">
            <p className="font-semibold text-ink-900">{l.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
