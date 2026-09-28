import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { Loader } from "../../components/Loader";
import { Vehicle } from "../../types";
import { useAuth } from "../../context/AuthContext";

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/vehicles/mine")
      .then(({ data }) => setVehicles(data.vehicles))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "56px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            OWNER FLEET PORTAL
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontSize: "clamp(3rem, 7vw, 5rem)",
              lineHeight: 0.9,
              letterSpacing: "0.01em",
              color: "#F9D3CD",
              textTransform: "uppercase",
              margin: "6px 0 0",
            }}
          >
            GARAGE & LISTINGS.
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <span style={{ fontSize: "0.875rem", color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Account:</span>
            <StatusBadge status={user?.verificationStatus || "UNVERIFIED"} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/owner/bookings" className="btn-secondary" style={{ padding: "12px 20px", fontSize: "0.9375rem" }}>
            Bookings
          </Link>
          <Link to="/owner/earnings" className="btn-secondary" style={{ padding: "12px 20px", fontSize: "0.9375rem" }}>
            Earnings
          </Link>
          <Link to="/owner/vehicles/new" className="btn-primary" style={{ padding: "12px 24px", fontSize: "0.9375rem" }}>
            + Add Vehicle
          </Link>
        </div>
      </div>

      {/* Verification notice if unverified */}
      {user?.verificationStatus !== "VERIFIED" && (
        <div
          style={{
            marginTop: "36px",
            padding: "24px 28px",
            backgroundColor: "#4E050E",
            border: "1px solid rgba(255, 200, 100, 0.4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#FFD285", margin: 0, letterSpacing: "0.02em" }}>
              ACTION REQUIRED: VERIFY OWNER ID
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "4px" }}>
              Complete identity and vehicle document checks to approve your listings for tourist rentals.
            </p>
          </div>
          <Link to="/verification" className="btn-primary" style={{ padding: "12px 24px", whiteSpace: "nowrap" }}>
            Verify Identity →
          </Link>
        </div>
      )}

      {loading && <Loader message="Loading your garage..." />}
      {error && <p style={{ marginTop: "36px", color: "#FFAAAA", fontSize: "1.0625rem" }}>{error}</p>}

      {/* Vehicle Listings Rows */}
      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {vehicles.map((v) => (
          <div
            key={v.id}
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
                  fontSize: "1.625rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  margin: 0,
                }}
              >
                {v.brand} {v.model}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "6px", fontWeight: 500 }}>
                ₹{v.pricePerDay}/day · {v.city} · {v.vehicleType} · Reg: {v.registrationReference}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <StatusBadge status={v.status} />
              <StatusBadge status={v.verificationStatus} />
              <Link
                to={`/owner/vehicles/${v.id}/edit`}
                className="btn-secondary"
                style={{ padding: "10px 20px", fontSize: "0.875rem" }}
              >
                Manage →
              </Link>
            </div>
          </div>
        ))}

        {!loading && vehicles.length === 0 && (
          <div style={{ padding: "56px 0", textAlign: "left" }}>
            <p style={{ color: "#F0C4BC", fontSize: "1.0625rem" }}>
              No vehicles listed in your garage yet.
            </p>
            <Link
              to="/owner/vehicles/new"
              className="btn-primary"
              style={{ marginTop: "16px", display: "inline-block" }}
            >
              List Your First Bike →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
