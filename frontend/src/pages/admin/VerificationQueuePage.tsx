import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";

function fileUrl(fileRef: string): string {
  // fileRef looks like "local://driving-licences/168...-ab12cd.jpg"
  const path = fileRef.replace("local://", "");
  return `/api/uploads/file/${path}`;
}

export function VerificationQueuePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api
      .get("/admin/verifications", { params: { status: "UNDER_REVIEW" } })
      .then(({ data }) => setRecords(data.records))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, []);

  async function decide(id: string, status: "VERIFIED" | "REJECTED") {
    setBusyId(id);
    try {
      await api.patch(`/admin/verifications/${id}`, { status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Verification queue</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-5 space-y-3">
        {records.map((r) => (
          <div key={r.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink-900">
                {r.verificationType.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-ink-500">
                {r.user ? `${r.user.name} (${r.user.email}) · ${r.user.role}` : ""}
                {r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : ""}
              </p>
              <StatusBadge status={r.status} />
              {r.documents?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.documents.map((d: any) => (
                    <a
                      key={d.id}
                      href={fileUrl(d.secureFileReference)}
                      target="_blank"
                      rel="noreferrer"
                      className="chip !py-1 text-xs"
                    >
                      📄 View {d.documentType.replace(/_/g, " ").toLowerCase()}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, "VERIFIED")}
                className="btn-primary !py-1.5 !px-3 text-sm"
              >
                Approve
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, "REJECTED")}
                className="btn-danger !py-1.5 !px-3 text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {records.length === 0 && <p className="text-ink-500">Nothing pending review.</p>}
      </div>
    </div>
  );
}
