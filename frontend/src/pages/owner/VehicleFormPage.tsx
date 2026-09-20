import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { UploadArea } from "../../components/UploadArea";
import { resolvePhotoUrl } from "../../components/VehicleGallery";

const TYPES = [
  { id: "SCOOTER", label: "Scooter / Moped", icon: "🛵" },
  { id: "MOTORCYCLE", label: "Motorcycle / Bike", icon: "🏍️" },
  { id: "EBIKE", label: "Electric Bike / Scooter", icon: "⚡" },
  { id: "BICYCLE", label: "Bicycle", icon: "🚲" },
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
  const [docQueue, setDocQueue] = useState<{ documentType: string; secureFileReference: string; fileName?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

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

    // Validation
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

      // Submit queued documents if any
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

      // Submit for admin approval if requested
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {mode === "create" ? "Register a new ride" : "Edit vehicle details"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            List your bike or car for verified local riders. Minimum 2 vehicle photos & RC verification required.
          </p>
        </div>
        {mode === "edit" && vehicleStatus && (
          <span className="chip text-xs uppercase tracking-wider">{vehicleStatus}</span>
        )}
      </div>

      <form
        className="mt-6 space-y-6"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          handleSave(false);
        }}
      >
        {/* Step 1: Vehicle Specifications */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-glass-border pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">
              1
            </span>
            <h2 className="font-display font-semibold text-ink-900">Vehicle Specifications</h2>
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label className="label">Vehicle Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("vehicleType", t.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm transition-all ${
                    form.vehicleType === t.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-300 font-semibold shadow-sm"
                      : "border-glass-border bg-glass-surface hover:border-glass-border-strong text-ink-700"
                  }`}
                >
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand / Make</label>
              <input
                className="input"
                placeholder="e.g. Royal Enfield, Honda, Yamaha"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Registration Number</label>
              <input
                className="input uppercase"
                placeholder="e.g. RJ14 AB 1234"
                value={form.registrationReference}
                onChange={(e) => set("registrationReference", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Price per day (₹)</label>
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
              <label className="label">Security Deposit (₹)</label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="₹ Refundable deposit"
                className="input"
                value={form.securityDeposit}
                onChange={(e) => set("securityDeposit", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location & GPS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">City / Region</label>
              <input
                className="input"
                placeholder="e.g. Jaipur"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="label">Coordinates (Latitude, Longitude)</label>
                <button
                  type="button"
                  onClick={detectGPS}
                  disabled={detectingLocation}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1 mb-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {detectingLocation ? "Detecting GPS..." : "Auto-detect GPS"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
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

          <div>
            <label className="label">Ride Highlights & Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Describe condition, mileage, helmet inclusion, recent service, or pickup instructions..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        {/* Step 2: Vehicle Photos (Minimum 2 Required) */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-glass-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">
                2
              </span>
              <div>
                <h2 className="font-display font-semibold text-ink-900">Vehicle Photos</h2>
                <p className="text-xs text-ink-500">Minimum two high-resolution photos required.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  photos.length >= 2
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {photos.length} / 2 photos uploaded
              </span>
              <button
                type="button"
                onClick={applyDemoPhotos}
                className="text-xs text-brand-400 hover:text-brand-300 underline font-medium"
              >
                + Add sample photos
              </button>
            </div>
          </div>

          <UploadArea
            category="bike-images"
            label="Upload Bike / Vehicle Photo (Front, Side, or Rear Angle)"
            accept=".jpg,.jpeg,.png,.webp"
            onUploaded={(r) => handlePhotoUploaded(r.fileRef)}
          />

          {/* Photo Gallery Grid */}
          {photos.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-ink-500 mb-2">
                Click "Make Cover" to set the primary thumbnail image shown in search.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative h-28 overflow-hidden rounded-xl border border-glass-border bg-neutral-900/40 shadow-sm"
                  >
                    <img src={photoUrl} alt={`Vehicle view ${idx + 1}`} className="h-full w-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 rounded-md bg-brand-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        Cover Photo
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeCoverPhoto(idx)}
                          className="rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/40 text-xs font-semibold"
                          title="Set as Cover"
                        >
                          Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="rounded-lg bg-red-600/80 p-1.5 text-white hover:bg-red-600"
                        title="Delete photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Document Verification */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-glass-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">
                3
              </span>
              <div>
                <h2 className="font-display font-semibold text-ink-900">Document Verification</h2>
                <p className="text-xs text-ink-500">Official RC certificate required for admin verification approval.</p>
              </div>
            </div>
            {hasRcDoc && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400 border border-green-500/30">
                ✓ RC attached
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UploadArea
              category="rc-certificates"
              label="RC Certificate (Registration Card)"
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
              label="Vehicle Insurance / PUC (Optional)"
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
            <div className="rounded-xl bg-glass-surface p-3 border border-glass-border text-xs text-ink-700">
              <span className="font-medium text-ink-900">Ready to submit for verification:</span>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-ink-500">
                {docQueue.map((doc, idx) => (
                  <li key={idx}>
                    {doc.documentType === "VEHICLE_RC" ? "Registration Certificate (RC)" : "Vehicle Insurance / Document"}{" "}
                    {doc.fileName ? `(${doc.fileName})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-secondary flex-1 py-3"
          >
            {submitting ? "Saving..." : mode === "create" ? "Save as Draft" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={submitting || photos.length < 2}
            className={`btn-primary flex-1 py-3 ${photos.length < 2 ? "opacity-60 cursor-not-allowed" : ""}`}
            title={photos.length < 2 ? "Upload at least 2 photos to submit for approval" : ""}
          >
            {submitting ? "Processing..." : "Submit for Verification & Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
