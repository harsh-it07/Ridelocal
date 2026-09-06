import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { UploadArea } from "../../components/UploadArea";

const TYPES = ["SCOOTER", "MOTORCYCLE", "BICYCLE", "EBIKE"];

export function VehicleFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    brand: "",
    model: "",
    vehicleType: "SCOOTER",
    registrationReference: "",
    pricePerDay: "",
    securityDeposit: "",
    city: "Jaipur",
    latitude: "26.9124",
    longitude: "75.7873",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState<string | null>(null);
  const [docQueue, setDocQueue] = useState<{ documentType: string; secureFileReference: string }[]>([]);
  const [submittingDocs, setSubmittingDocs] = useState(false);
  const [docsSubmitted, setDocsSubmitted] = useState(false);

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
      });
    }
  }, [mode, id]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        vehicleType: form.vehicleType,
        registrationReference: form.registrationReference,
        pricePerDay: Number(form.pricePerDay),
        securityDeposit: Number(form.securityDeposit),
        city: form.city,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        description: form.description || undefined,
        photoUrls: [],
      };

      if (mode === "create") {
        const { data } = await api.post("/vehicles", payload);
        navigate(`/owner/vehicles/${data.vehicle.id}/edit`);
      } else {
        await api.patch(`/vehicles/${id}`, payload);
        navigate("/owner");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitForApproval() {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.post(`/vehicles/${id}/submit`);
      navigate("/owner");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitDocuments() {
    if (!id || docQueue.length === 0) return;
    setSubmittingDocs(true);
    try {
      await api.post("/verification/submit", {
        verificationType: "VEHICLE_DOCUMENTS",
        vehicleId: id,
        documents: docQueue,
      });
      setDocQueue([]);
      setDocsSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingDocs(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">
        {mode === "create" ? "Add a vehicle" : "Edit vehicle"}
      </h1>

      <form className="card mt-5 space-y-4 p-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Brand</label>
            <input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} required />
          </div>
          <div>
            <label className="label">Model</label>
            <input className="input" value={form.model} onChange={(e) => set("model", e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Vehicle type</label>
            <select
              className="input"
              value={form.vehicleType}
              onChange={(e) => set("vehicleType", e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Registration reference</label>
            <input
              className="input"
              value={form.registrationReference}
              onChange={(e) => set("registrationReference", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Price per day (₹)</label>
            <input
              type="number"
              className="input"
              value={form.pricePerDay}
              onChange={(e) => set("pricePerDay", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Security deposit (₹)</label>
            <input
              type="number"
              className="input"
              value={form.securityDeposit}
              onChange={(e) => set("securityDeposit", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">City</label>
          <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Latitude</label>
            <input
              className="input"
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input
              className="input"
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {mode === "create" ? "Save as draft" : "Save changes"}
          </button>
          {mode === "edit" && vehicleStatus === "DRAFT" && (
            <button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={submitting}
              className="btn-secondary flex-1"
            >
              Submit for approval
            </button>
          )}
        </div>
      </form>

      {mode === "edit" && id && (
        <div className="card mt-5 p-6">
          <h2 className="font-display font-bold text-ink-900">Documents & photos</h2>
          <p className="mt-1 text-sm text-ink-500">
            Upload your RC certificate and bike photos — an admin reviews these before the
            listing can go live.
          </p>
          <div className="mt-4 space-y-4">
            <UploadArea
              category="rc-certificates"
              label="RC certificate"
              onUploaded={(r) => setDocQueue((q) => [...q, { documentType: "VEHICLE_RC", secureFileReference: r.fileRef }])}
            />
            <UploadArea
              category="bike-images"
              label="Bike photo"
              accept=".jpg,.jpeg,.png"
              onUploaded={(r) => setDocQueue((q) => [...q, { documentType: "VEHICLE_PHOTO", secureFileReference: r.fileRef }])}
            />
          </div>

          {docQueue.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-ink-700">{docQueue.length} file(s) ready to submit.</p>
              <button
                onClick={handleSubmitDocuments}
                disabled={submittingDocs}
                className="btn-primary mt-2 !py-2 !px-4 text-sm"
              >
                {submittingDocs ? "Submitting..." : "Submit documents for review"}
              </button>
              {docsSubmitted && (
                <p className="mt-2 text-sm text-green-600">
                  Documents submitted — vehicle verification is now under review.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "edit" && id && (
        <p className="mt-4 text-sm text-ink-500">
          Manage availability from the{" "}
          <a href={`/owner/vehicles/${id}/availability`} className="text-brand-600 font-medium">
            availability manager
          </a>
          .
        </p>
      )}
    </div>
  );
}
