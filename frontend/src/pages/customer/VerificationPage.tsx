import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { UploadArea } from "../../components/UploadArea";

export function VerificationPage() {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<string>("UNVERIFIED");
  const [uploads, setUploads] = useState<{ drivingLicence: string | null; aadharCard: string | null }>({
    drivingLicence: null,
    aadharCard: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setStatus(user.verificationStatus || "UNVERIFIED");
  }, [user]);

  async function handleSubmit() {
    if (!uploads.drivingLicence) {
      setError("Please upload your driving licence.");
      return;
    }
    if (!uploads.aadharCard) {
      setError("Please upload your Aadhaar card.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/verification/submit", {
        verificationType: "USER_IDENTITY",
        documents: [
          {
            documentType: "DRIVING_LICENSE",
            secureFileReference: uploads.drivingLicence,
          },
          {
            documentType: "GOVT_ID",
            secureFileReference: uploads.aadharCard,
          },
        ],
      });
      setSubmitted(true);
      await refreshUser();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const isVerified = status === "VERIFIED";
  const isPending = status === "PENDING_REVIEW" || status === "UNDER_REVIEW" || status === "PENDING" || submitted;
  const isRejected = status === "REJECTED" && !submitted;

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        SAFETY & COMPLIANCE
      </p>
      <h1
        style={{
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
          fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          color: "#F9D3CD",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}
      >
        VERIFY IDENTITY.
      </h1>
      <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px", fontWeight: 500 }}>
        To reserve a two-wheeler in Jaipur, we verify your driving licence and Aadhaar card. This keeps both riders and vehicle owners secure.
      </p>

      {/* Steps Row */}
      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)", paddingTop: "28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            { num: "01", label: "UPLOAD DOCUMENTS", done: !!uploads.drivingLicence && !!uploads.aadharCard },
            { num: "02", label: "ADMIN REVIEW", done: isPending || isVerified },
            { num: "03", label: "READY TO RIDE", done: isVerified },
          ].map((s) => (
            <div key={s.num}>
              <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: s.done ? "#FFFFFF" : "#F9D3CD", margin: 0, lineHeight: 1 }}>
                {s.num}
              </p>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: s.done ? "#FFFFFF" : "#F0C4BC", marginTop: "6px", letterSpacing: "0.08em" }}>
                {s.done ? "✓ " : ""}{s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status Panels */}
      {isVerified && (
        <div style={{ marginTop: "36px", padding: "24px", backgroundColor: "#4E050E", border: "1px solid #F9D3CD" }}>
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD", margin: 0 }}>✓ IDENTITY VERIFIED</p>
          <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "6px" }}>
            Your driving licence and Aadhaar card have been verified. You are fully approved to rent any verified motorcycle or scooter across Jaipur.
          </p>
          <Link to="/search" className="btn-primary" style={{ marginTop: "16px", display: "inline-block" }}>
            Explore Fleet →
          </Link>
        </div>
      )}

      {isPending && !isVerified && (
        <div style={{ marginTop: "36px", padding: "24px", backgroundColor: "#4E050E", border: "1px solid rgba(255, 200, 100, 0.4)" }}>
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#FFD285", margin: 0 }}>DOCUMENTS UNDER REVIEW</p>
          <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "6px" }}>
            Our operations team in Jaipur is reviewing your driving licence and Aadhaar card. This usually takes less than 30 minutes during active hours.
          </p>
        </div>
      )}

      {isRejected && (
        <div style={{ marginTop: "36px", padding: "24px", backgroundColor: "#4E050E", border: "1px solid #FFAAAA" }}>
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#FFAAAA", margin: 0 }}>✕ VERIFICATION REJECTED</p>
          <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "6px" }}>
            Your previous document submission could not be approved. Please re-upload clear photos of your Driving Licence and Aadhaar Card below.
          </p>
        </div>
      )}

      {/* Upload Form */}
      {!isVerified && !isPending && (
        <div style={{ marginTop: "36px" }}>
          <UploadArea
            category="driving-licences"
            label="1. Driving Licence"
            onUploaded={(r) => {
              setUploads((prev) => ({ ...prev, drivingLicence: r.fileRef }));
              setError(null);
            }}
          />
          <div style={{ marginTop: "24px" }}>
            <UploadArea
              category="identity-documents"
              label="2. Aadhaar Card"
              onUploaded={(r) => {
                setUploads((prev) => ({ ...prev, aadharCard: r.fileRef }));
                setError(null);
              }}
            />
          </div>

          {error && <p style={{ fontSize: "0.8125rem", color: "#FFAAAA", marginTop: "16px" }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !uploads.drivingLicence || !uploads.aadharCard}
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: "28px",
              padding: "16px",
              fontSize: "0.875rem",
              opacity: (!uploads.drivingLicence || !uploads.aadharCard) ? 0.35 : 1,
            }}
          >
            {submitting ? "Submitting..." : "Submit Documents for Review →"}
          </button>
        </div>
      )}
    </div>
  );
}
