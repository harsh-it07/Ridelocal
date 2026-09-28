import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";

function fileUrl(fileRef: string): string {
  if (!fileRef) return "";
  if (fileRef.startsWith("http")) return fileRef;
  const path = fileRef.replace("local://", "");
  return `/api/uploads/file/${path}`;
}

export function VehicleApprovalPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        ADMINISTRATION
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
        VEHICLE APPROVALS.
      </h1>
      <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px" }}>
        Review submitted two-wheelers, RC certificates, photos, and compliance.
      </p>

      {error && <p style={{ marginTop: "24px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {vehicles.map((v) => {
          const isExpanded = expandedId === v.id;
          return (
            <div
              key={v.id}
              style={{
                padding: "24px 0",
                borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <p
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {v.brand} {v.model} ({v.vehicleType})
                  </p>
                  <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
                    Owner: {v.owner?.name} ({v.owner?.email}) — Verification:{" "}
                    <span style={{ color: v.owner?.verificationStatus === "VERIFIED" ? "#FFFFFF" : "#FFD285", fontWeight: 700 }}>
                      {v.owner?.verificationStatus}
                    </span>
                  </p>
                  <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
                    ₹{v.pricePerDay}/day · {v.city} · Reg: {v.registrationReference}
                  </p>

                  {v.documents?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {v.documents.map((d: any) => (
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
                          View {d.documentType.replace(/_/g, " ").toLowerCase()} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      disabled={busyId === v.id}
                      onClick={() => decide(v.id, true)}
                      className="btn-primary"
                      style={{ padding: "8px 18px", fontSize: "0.875rem" }}
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === v.id}
                      onClick={() => decide(v.id, false)}
                      className="btn-danger"
                      style={{ padding: "8px 18px", fontSize: "0.875rem" }}
                    >
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {isExpanded ? "Hide Details [—]" : "View Details [+]"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: "20px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="admin-detail-subgrid">
                  <div>
                    {v.photoUrls && v.photoUrls.length > 0 ? (
                      <div>
                        <img
                          src={fileUrl(v.photoUrls[0])}
                          alt={v.model}
                          style={{ width: "100%", height: "200px", objectFit: "cover", border: "1px solid rgba(249, 211, 205, 0.25)" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        {v.photoUrls.length > 1 && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px", overflowX: "auto" }}>
                            {v.photoUrls.slice(1).map((url: string, idx: number) => (
                              <img
                                key={idx}
                                src={fileUrl(url)}
                                alt={`${v.model} ${idx + 2}`}
                                style={{ width: "64px", height: "48px", objectFit: "cover", border: "1px solid rgba(249, 211, 205, 0.25)", flexShrink: 0 }}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "#F0C4BC", fontSize: "0.9375rem" }}>No photos uploaded.</p>
                    )}
                  </div>

                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase" }}>Financials</p>
                    <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "2px" }}>
                      Rate: ₹{v.pricePerDay}/day · Deposit: ₹{v.securityDeposit}
                    </p>

                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", marginTop: "14px" }}>Hub Location</p>
                    <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "2px" }}>
                      {v.city} (Lat: {v.latitude}, Lng: {v.longitude})
                    </p>

                    {v.description && (
                      <div style={{ marginTop: "14px" }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase" }}>Owner Description</p>
                        <p style={{ fontSize: "0.9375rem", color: "#F9D3CD", marginTop: "2px", lineHeight: 1.5 }}>{v.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "36px 0" }}>
            No vehicles currently awaiting admin approval.
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

      <style>{`
        @media (max-width: 640px) {
          .admin-detail-subgrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
