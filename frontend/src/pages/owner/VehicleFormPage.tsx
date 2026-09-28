import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { UploadArea } from "../../components/UploadArea";
import { resolvePhotoUrl } from "../../components/VehicleGallery";

const TYPES = [
  { id: "SCOOTER", label: "Scooter / Moped" },
  { id: "MOTORCYCLE", label: "Motorcycle / Bike" },
  { id: "EBIKE", label: "Electric Two-Wheeler" },
  { id: "BICYCLE", label: "Bicycle" },
];

const DEMO_PHOTO_SETS: Record<string, string[]> = {
  MOTORCYCLE: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
  ],
  SCOOTER: [
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
  ],
  EBIKE: [
    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
  ],
  BICYCLE: [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
  ],
};

export function VehicleFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    brand: "",
    model: "",
    vehicleType: "MOTORCYCLE",
    registrationReference: "",
    pricePerDay: "",
    securityDeposit: "",
    city: "Jaipur",
    latitude: "26.9124",
    longitude: "75.7873",
    description: "",
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [docQueue, setDocQueue] = useState<{ documentType: string; secureFileReference: string; fileName?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  function handleAddPhotoUrl() {
    if (!photoUrlInput.trim()) return;
    setPhotos((prev) => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput("");
  }

  useEffect(() => {
    if (mode === "edit" && id) {
      api.get(`/vehicles/${id}`).then(({ data }) => {
        const v = data.vehicle;
        setForm({
          brand: v.brand,
          model: v.model,
          vehicleType: v.vehicleType,
          registrationReference: v.registrationReference,
          pricePerDay: String(v.pricePerDay),
          securityDeposit: String(v.securityDeposit),
          city: v.city,
          latitude: String(v.latitude),
          longitude: String(v.longitude),
          description: v.description || "",
        });
        setVehicleStatus(v.status);
        if (v.photoUrls && Array.isArray(v.photoUrls)) {
          setPhotos(v.photoUrls);
        }
      });
    }
  }, [mode, id]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotoUploaded(fileRef: string) {
    const url = resolvePhotoUrl(fileRef);
    setPhotos((prev) => [...prev, url]);
  }

  function removePhoto(indexToRemove: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function makeCoverPhoto(index: number) {
    setPhotos((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  }

  function applyDemoPhotos() {
    const presets = DEMO_PHOTO_SETS[form.vehicleType] || DEMO_PHOTO_SETS.MOTORCYCLE;
    setPhotos((prev) => Array.from(new Set([...prev, ...presets])));
  }

  function detectGPS() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude.toFixed(4));
        set("longitude", pos.coords.longitude.toFixed(4));
        setDetectingLocation(false);
      },
      (err) => {
        setError("Unable to retrieve location: " + err.message);
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  }

  async function handleSave(submitForApproval = false) {
    setError(null);

    if (!form.brand.trim() || !form.model.trim() || !form.registrationReference.trim()) {
      setError("Please fill in Brand, Model, and Registration Number.");
      return;
    }
    if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
      setError("Please enter a valid price per day.");
      return;
    }

    if (submitForApproval) {
      if (photos.length < 2) {
        setError("Minimum 2 photos of the vehicle are required before submitting for approval.");
        return;
      }
      const hasRC = docQueue.some((d) => d.documentType === "VEHICLE_RC");
      if (mode === "create" && !hasRC) {
        setError("Please upload the RC certificate for document verification.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        vehicleType: form.vehicleType,
        registrationReference: form.registrationReference,
        pricePerDay: Number(form.pricePerDay),
        securityDeposit: Number(form.securityDeposit || 0),
        city: form.city,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        description: form.description || undefined,
        photoUrls: photos,
      };

      let vehicleId = id;

      if (mode === "create") {
        const { data } = await api.post("/vehicles", payload);
        vehicleId = data.vehicle.id;
      } else {
        await api.patch(`/vehicles/${id}`, payload);
      }

      if (docQueue.length > 0 && vehicleId) {
        await api.post("/verification/submit", {
          verificationType: "VEHICLE_DOCUMENTS",
          vehicleId,
          documents: docQueue.map((d) => ({
            documentType: d.documentType,
            secureFileReference: d.secureFileReference,
          })),
        });
      }

      if (submitForApproval && vehicleId) {
        await api.post(`/vehicles/${vehicleId}/submit`);
      }

      navigate("/owner");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const hasRcDoc = docQueue.some((d) => d.documentType === "VEHICLE_RC");

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px" }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          OWNER FLEET MANAGEMENT
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
              margin: "6px 0 0",
            }}
          >
            {mode === "create" ? "LIST A NEW RIDE." : "EDIT VEHICLE."}
          </h1>
          {mode === "edit" && vehicleStatus && (
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F9D3CD", textTransform: "uppercase", border: "1px solid #F9D3CD", padding: "4px 12px" }}>
              {vehicleStatus}
            </span>
          )}
        </div>
        <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "10px", fontWeight: 500 }}>
          List your two-wheeler for vetted travelers. 2+ photos & RC certificate required for admin verification.
        </p>
      </div>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          handleSave(false);
        }}
        style={{ marginTop: "44px" }}
      >
        {/* Section 01: Specifications */}
        <div style={{ borderTop: "1px solid rgba(249, 211, 205, 0.35)", paddingTop: "28px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "24px" }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD" }}>01</span>
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#FFFFFF", margin: 0 }}>
              VEHICLE SPECIFICATIONS
            </h2>
          </div>

          {/* Vehicle Type */}
          <div style={{ marginBottom: "20px" }}>
            <label className="label">Vehicle Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", marginTop: "6px" }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("vehicleType", t.id)}
                  style={{
                    padding: "14px",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    border: form.vehicleType === t.id ? "1px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.2)",
                    backgroundColor: form.vehicleType === t.id ? "#F9D3CD" : "rgba(0, 0, 0, 0.2)",
                    color: form.vehicleType === t.id ? "#680A16" : "#F0C4BC",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }} className="form-two-col">
            <div>
              <label className="label">Brand / Make</label>
              <input
                className="input"
                placeholder="e.g. Royal Enfield, Honda"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Model & Variant</label>
              <input
                className="input"
                placeholder="e.g. Classic 350, Activa 6G"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }} className="form-three-col">
            <div>
              <label className="label">Registration No.</label>
              <input
                className="input"
                placeholder="RJ14 AB 1234"
                value={form.registrationReference}
                onChange={(e) => set("registrationReference", e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <label className="label">Daily Rate (₹)</label>
              <input
                type="number"
                min="50"
                step="10"
                placeholder="₹ Daily Rate"
                className="input"
                value={form.pricePerDay}
                onChange={(e) => set("pricePerDay", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Deposit (₹)</label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="₹ Refundable"
                className="input"
                value={form.securityDeposit}
                onChange={(e) => set("securityDeposit", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location & GPS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }} className="form-location-col">
            <div>
              <label className="label">City Hub</label>
              <input
                className="input"
                placeholder="Jaipur"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                required
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="label" style={{ marginBottom: 0 }}>Coordinates (Lat, Lng)</label>
                <button
                  type="button"
                  onClick={detectGPS}
                  disabled={detectingLocation}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {detectingLocation ? "Detecting..." : "Auto-detect GPS"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                <input
                  className="input"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => set("latitude", e.target.value)}
                  required
                />
                <input
                  className="input"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => set("longitude", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label className="label">Vehicle Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="State condition, service history, helmets provided, pickup instructions..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        {/* Section 02: Photos */}
        <div style={{ borderTop: "1px solid rgba(249, 211, 205, 0.35)", paddingTop: "28px", marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD" }}>02</span>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#FFFFFF", margin: 0 }}>
                VEHICLE PHOTOS
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "0.875rem", color: photos.length >= 2 ? "#FFFFFF" : "#FFD285", fontWeight: 700 }}>
                {photos.length} / 2 required
              </span>
              <button
                type="button"
                onClick={applyDemoPhotos}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#F9D3CD",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                + Add sample photos
              </button>
            </div>
          </div>

          <UploadArea
            category="bike-images"
            label="Upload Vehicle Photos (Front, Side, or Rear Angle)"
            accept=".jpg,.jpeg,.png,.webp"
            onUploaded={(r) => handlePhotoUploaded(r.fileRef)}
          />

          <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="url"
                placeholder="Or paste an image URL (e.g. from Google or web link)"
                className="input"
                style={{ padding: "10px 14px", fontSize: "0.875rem" }}
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPhotoUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="btn-secondary"
                style={{ padding: "10px 18px", fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                + Add URL
              </button>
            </div>
          </div>

          {photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px", marginTop: "18px" }}>
              {photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    height: "105px",
                    overflow: "hidden",
                    border: idx === 0 ? "2px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.2)",
                    backgroundColor: "#4E050E",
                  }}
                >
                  <img src={photoUrl} alt={`Vehicle view ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {idx === 0 && (
                    <span style={{ position: "absolute", top: 4, left: 4, backgroundColor: "#F9D3CD", color: "#680A16", fontSize: "0.5625rem", fontWeight: 800, padding: "2px 5px", textTransform: "uppercase" }}>
                      Cover
                    </span>
                  )}
                  <div style={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: "4px" }}>
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCoverPhoto(idx)}
                        style={{ backgroundColor: "rgba(78, 5, 14, 0.9)", color: "#F9D3CD", border: "1px solid rgba(249, 211, 205, 0.3)", fontSize: "0.625rem", padding: "2px 5px", cursor: "pointer", fontWeight: 700 }}
                      >
                        Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{ backgroundColor: "#9B2C2C", color: "#FFFFFF", border: "none", fontSize: "0.625rem", padding: "2px 5px", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 03: Documents */}
        <div style={{ borderTop: "1px solid rgba(249, 211, 205, 0.35)", paddingTop: "28px", marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD" }}>03</span>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#FFFFFF", margin: 0 }}>
                DOCUMENT VERIFICATION
              </h2>
            </div>
            {hasRcDoc && (
              <span style={{ fontSize: "0.875rem", color: "#FFFFFF", fontWeight: 700 }}>
                ✓ RC attached
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-two-col">
            <UploadArea
              category="rc-certificates"
              label="RC Certificate (Required)"
              accept=".jpg,.jpeg,.png,.pdf"
              onUploaded={(r) =>
                setDocQueue((q) => [
                  ...q.filter((item) => item.documentType !== "VEHICLE_RC"),
                  { documentType: "VEHICLE_RC", secureFileReference: r.fileRef, fileName: r.fileName },
                ])
              }
            />

            <UploadArea
              category="other-documents"
              label="Insurance / PUC (Optional)"
              accept=".jpg,.jpeg,.png,.pdf"
              onUploaded={(r) =>
                setDocQueue((q) => [
                  ...q.filter((item) => item.documentType !== "VEHICLE_INSURANCE"),
                  { documentType: "VEHICLE_INSURANCE", secureFileReference: r.fileRef, fileName: r.fileName },
                ])
              }
            />
          </div>

          {docQueue.length > 0 && (
            <div style={{ marginTop: "16px", border: "1px solid rgba(249, 211, 205, 0.25)", backgroundColor: "#4E050E", padding: "16px 20px", fontSize: "0.875rem", color: "#F0C4BC" }}>
              <p style={{ fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", margin: 0 }}>Documents queued for review:</p>
              <ul style={{ marginTop: "6px", paddingLeft: "16px", margin: 0 }}>
                {docQueue.map((doc, idx) => (
                  <li key={idx}>
                    {doc.documentType === "VEHICLE_RC" ? "Registration Certificate (RC)" : "Vehicle Document"}{" "}
                    {doc.fileName ? `(${doc.fileName})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontSize: "0.875rem", color: "#FFAAAA", marginTop: "24px" }}>
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "14px", marginTop: "36px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "28px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn-secondary"
            style={{ flex: 1, padding: "16px", fontSize: "0.875rem" }}
          >
            {submitting ? "Saving..." : mode === "create" ? "Save as Draft" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={submitting || photos.length < 2}
            className="btn-primary"
            style={{
              flex: 1,
              padding: "16px",
              fontSize: "0.875rem",
              opacity: photos.length < 2 ? 0.4 : 1,
            }}
          >
            {submitting ? "Processing..." : "Submit for Approval →"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: "36px" }}>
        <Link
          to="/owner"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Dashboard
        </Link>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-two-col, .form-three-col, .form-location-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
