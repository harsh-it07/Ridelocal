import { FormEvent, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { UploadArea } from "../../components/UploadArea";
import { useAuth } from "../../context/AuthContext";

export function VerificationPage() {
  const { user, refreshUser } = useAuth();
  const [govtIdRef, setGovtIdRef] = useState<string | null>(null);
  const [licenseRef, setLicenseRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const documents = [
        govtIdRef && { documentType: "GOVT_ID", secureFileReference: govtIdRef },
        licenseRef && { documentType: "DRIVING_LICENSE", secureFileReference: licenseRef },
      ].filter(Boolean);

      await api.post("/verification/submit", {
        verificationType: user?.role === "OWNER" ? "OWNER_KYC" : "USER_IDENTITY",
        documents,
      });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Identity verification</h1>
      <p className="mt-1 text-sm text-ink-500">
        To help keep RideLocal safe for owners and travelers, we verify driving licences before
        confirming a rental. Files are stored securely and only you and our admin team can view
        them.
      </p>

      <form className="card mt-5 space-y-4 p-6" onSubmit={handleSubmit}>
        <UploadArea
          category="other-documents"
          label="Government ID"
          onUploaded={(r) => setGovtIdRef(r.fileRef)}
        />
        <UploadArea
          category="driving-licences"
          label="Driving licence"
          onUploaded={(r) => setLicenseRef(r.fileRef)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">
            Submitted! Your verification status is now under review.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || (!govtIdRef && !licenseRef)}
          className="btn-primary w-full"
        >
          {submitting ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
