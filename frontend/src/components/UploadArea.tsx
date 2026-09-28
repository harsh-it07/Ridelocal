import { useRef, useState } from "react";
import { api, getErrorMessage } from "../api/client";

export type UploadCategory =
  | "driving-licences"
  | "rc-certificates"
  | "bike-images"
  | "other-documents"
  | "identity-documents";

interface UploadResult {
  fileRef: string;
  fileName: string;
  fileType: string;
}

export function UploadArea({
  category,
  label,
  accept = ".jpg,.jpeg,.png,.pdf",
  onUploaded,
}: {
  category: UploadCategory;
  label: string;
  accept?: string;
  onUploaded: (result: UploadResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post<UploadResult>(`/uploads/${category}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setStatus("done");
      onUploaded(data);
    } catch (err) {
      setStatus("error");
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        style={{
          cursor: "pointer",
          border: "1px dashed rgba(249, 211, 205, 0.35)",
          padding: "24px",
          textAlign: "center",
          transition: "border-color 150ms ease, background-color 150ms ease",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#F9D3CD";
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(249, 211, 205, 0.35)";
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {status === "idle" && (
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", margin: 0 }}>
            <span style={{ fontWeight: 700, color: "#F9D3CD" }}>Click to select file</span> or drag & drop here
            <br />
            <span style={{ fontSize: "0.8125rem", color: "rgba(249, 211, 205, 0.75)", marginTop: "4px", display: "inline-block" }}>JPG, PNG, WEBP, or PDF</span>
          </p>
        )}

        {status !== "idle" && (
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.9375rem" }}>
              <span style={{ fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fileName}
              </span>
              {status === "done" && <span style={{ color: "#F9D3CD", fontWeight: 700 }}>✓ Uploaded</span>}
              {status === "error" && <span style={{ color: "#FFAAAA", fontWeight: 700 }}>✕ Upload Failed</span>}
            </div>
            {status === "uploading" && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="loader loader-sm" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, height: "4px", overflow: "hidden", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                  <div
                    style={{ height: "100%", backgroundColor: "#F9D3CD", transition: "width 200ms ease", width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {error && <p style={{ marginTop: "8px", fontSize: "0.8125rem", color: "#FFAAAA", margin: 0 }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
