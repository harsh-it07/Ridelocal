import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";

function fileUrl(fileRef: string): string {
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
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        COMPLIANCE AUDIT
      </p>
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
        VERIFICATION QUEUE.
      </h1>
      <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px" }}>
        Review driving licences, owner IDs, and vehicle certificates awaiting verification.
      </p>

      {error && <p style={{ marginTop: "24px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {records.map((r) => (
          <div
            key={r.id}
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
                {r.verificationType.replace(/_/g, " ")}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
                {r.user ? `${r.user.name} (${r.user.email}) · ${r.user.role}` : ""}
                {r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : ""}
              </p>
              <div style={{ marginTop: "6px" }}>
                <StatusBadge status={r.status} />
              </div>
              {r.documents?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                  {r.documents.map((d: any) => (
                    <a
                      key={d.id}
                      href={fileUrl(d.secureFileReference)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "#F9D3CD",
                        border: "1px solid rgba(249, 211, 205, 0.3)",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        padding: "5px 10px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      View {d.documentType === "DRIVING_LICENSE" ? "Driving Licence" : d.documentType === "GOVT_ID" ? "Aadhaar Card" : d.documentType === "VEHICLE_RC" ? "RC Certificate" : d.documentType.replace(/_/g, " ")} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, "VERIFIED")}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                Approve
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, "REJECTED")}
                className="btn-danger"
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {records.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "36px 0" }}>
            No submissions currently awaiting verification.
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
