import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";

export function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");

  function load() {
    api
      .get("/admin/users", { params: { role: roleFilter || undefined } })
      .then(({ data }) => setUsers(data.users))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, [roleFilter]);

  async function toggleSuspend(id: string, isSuspended: boolean) {
    await api.patch(`/admin/users/${id}/status`, { isSuspended: !isSuspended });
    load();
  }

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        ADMINISTRATION
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
            fontSize: "clamp(3rem, 7vw, 5rem)",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
            color: "#F9D3CD",
            textTransform: "uppercase",
            margin: "8px 0 0",
          }}
        >
          USER ACCOUNTS.
        </h1>
        <select
          className="input"
          style={{ width: "auto", padding: "8px 16px", fontSize: "0.875rem" }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Account Roles</option>
          <option value="CUSTOMER">Customers (Tourists)</option>
          <option value="OWNER">Vehicle Owners</option>
          <option value="ADMIN">Platform Admins</option>
        </select>
      </div>

      {error && <p style={{ marginTop: "24px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "24px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.375rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {u.name} <span style={{ color: "#F0C4BC", fontWeight: 400, fontSize: "1rem" }}>· {u.role}</span>
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>{u.email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <StatusBadge status={u.verificationStatus} />
              {u.isSuspended && <StatusBadge status="SUSPENDED" />}
              <button
                onClick={() => toggleSuspend(u.id, u.isSuspended)}
                className={u.isSuspended ? "btn-secondary" : "btn-danger"}
                style={{ padding: "8px 16px", fontSize: "0.875rem" }}
              >
                {u.isSuspended ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "36px 0" }}>
            No accounts found matching filter.
          </p>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <Link
          to="/admin"
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Admin Hub
        </Link>
      </div>
    </div>
  );
}
