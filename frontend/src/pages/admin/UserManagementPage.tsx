import { useEffect, useState } from "react";
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">User management</h1>
        <select className="input !w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-5 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink-900">
                {u.name} <span className="text-ink-500 font-normal">· {u.role}</span>
              </p>
              <p className="text-sm text-ink-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={u.verificationStatus} />
              {u.isSuspended && <StatusBadge status="SUSPENDED" />}
              <button
                onClick={() => toggleSuspend(u.id, u.isSuspended)}
                className={u.isSuspended ? "btn-secondary !py-1.5 !px-3 text-sm" : "btn-danger !py-1.5 !px-3 text-sm"}
              >
                {u.isSuspended ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
