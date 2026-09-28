import { Link } from "react-router-dom";
import { RankedVehicle } from "../types";
import { resolvePhotoUrl } from "./VehicleGallery";

const DEFAULT_IMAGES: Record<string, string> = {
  SCOOTER: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=800&q=80",
  MOTORCYCLE: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
  BICYCLE: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
  EBIKE: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80",
};

export function VehicleCard({ vehicle }: { vehicle: RankedVehicle }) {
  const fallback = vehicle.model?.toLowerCase().includes("activa")
    ? "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=800&q=80"
    : (DEFAULT_IMAGES[vehicle.vehicleType] || DEFAULT_IMAGES.MOTORCYCLE);

  const photoUrl = vehicle.photoUrls?.[0]
    ? resolvePhotoUrl(vehicle.photoUrls[0])
    : fallback;

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      style={{
        display: "block",
        borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
        paddingBottom: "32px",
        marginBottom: "32px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Photo frame with fine border */}
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          height: "320px",
          backgroundColor: "#4E050E",
          border: "1px solid rgba(249, 211, 205, 0.25)",
          position: "relative",
        }}
      >
        <img
          src={photoUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 350ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        {/* Hub / City Tag in Blush */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(78, 5, 14, 0.92)",
            padding: "8px 14px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#F9D3CD",
            borderTop: "1px solid rgba(249, 211, 205, 0.25)",
            borderRight: "1px solid rgba(249, 211, 205, 0.25)",
          }}
        >
          {vehicle.city} · {vehicle.vehicleType}
        </div>
      </div>

      {/* Info Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "16px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h3
            style={{
              fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
              fontWeight: 700,
              fontSize: "1.875rem",
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {vehicle.brand} {vehicle.model}
          </h3>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "6px", fontWeight: 500 }}>
            Jaipur Hub {vehicle.distanceKm !== null && `· ${vehicle.distanceKm} km away`}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0 }}>
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2.25rem",
                color: "#F9D3CD",
                letterSpacing: "0.02em",
              }}
            >
              ₹{vehicle.pricePerDay}
            </span>
            <span style={{ fontSize: "0.875rem", color: "#F0C4BC", textTransform: "uppercase", marginLeft: "6px", fontWeight: 600 }}>
              / day
            </span>
          </p>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              borderBottom: "1px solid #FFFFFF",
              paddingBottom: "2px",
              marginTop: "6px",
            }}
          >
            Reserve Ride →
          </span>
        </div>
      </div>
    </Link>
  );
}
