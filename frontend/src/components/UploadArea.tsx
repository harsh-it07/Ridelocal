import { useRef, useState } from "react";
import { api, getErrorMessage } from "../api/client";

export type UploadCategory =
  | "driving-licences"
  | "rc-certificates"
  | "bike-images"
  | "other-documents";

interface UploadResult {
  fileRef: string;
  fileName: string;
  fileType: string;
}

// Real upload — POSTs to /api/uploads/:category, tracks progress, and
// reports back the resulting fileRef once the file actually lands on the
// server. Nothing here fakes success client-side.
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
        className="cursor-pointer rounded-xl border-2 border-dashed border-neutral-300 bg-white/60 p-4 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
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
          <p className="text-sm text-ink-500">
            <span className="font-medium text-brand-600">Click to upload</span> or drag a file here
            <br />
            <span className="text-xs">JPG, PNG, or PDF</span>
          </p>
        )}

        {status !== "idle" && (
          <div className="text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium text-ink-900">{fileName}</span>
              {status === "done" && <span className="text-green-600">✓ Uploaded</span>}
              {status === "error" && <span className="text-red-600">✕ Failed</span>}
            </div>
            {status === "uploading" && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
