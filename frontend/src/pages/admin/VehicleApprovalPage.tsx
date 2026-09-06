import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";

function fileUrl(fileRef: string): string {
  const path = fileRef.replace("local://", "");
  return `/api/uploads/file/${path}`;
}

export function VehicleApprovalPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api
      .get("/admin/vehicles/pending")
      .then(({ data }) => setVehicles(data.vehicles))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, []);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api.patch(`/admin/vehicles/${id}/approve`, { approve });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Vehicle approvals</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-5 space-y-3">
        {vehicles.map((v) => (
          <div key={v.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink-900">
                  {v.brand} {v.model} ({v.vehicleType})
                </p>
                <p className="text-sm text-ink-500">
                  Owner: {v.owner?.name} ({v.owner?.email}) — owner verification:{" "}
                  {v.owner?.verificationStatus}
                </p>
                <p className="text-sm text-ink-500">
                  ₹{v.pricePerDay}/day · {v.city} · Reg: {v.registrationReference}
                </p>
                {v.documents?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {v.documents.map((d: any) => (
                      <a
                        key={d.id}
                        href={fileUrl(d.secureFileReference)}
                        target="_blank"
                        rel="noreferrer"
                        className="chip !py-1 text-xs"
                      >
                        📄 {d.documentType.replace(/_/g, " ").toLowerCase()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busyId === v.id}
                  onClick={() => decide(v.id, true)}
                  className="btn-primary !py-1.5 !px-3 text-sm"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === v.id}
                  onClick={() => decide(v.id, false)}
                  className="btn-danger !py-1.5 !px-3 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-ink-500">No vehicles pending review.</p>}
      </div>
    </div>
  );
}
