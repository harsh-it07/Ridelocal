import { useState } from "react";

export function resolvePhotoUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("local://")) {
    return `/api/uploads/file/${url.replace("local://", "")}`;
  }
  return url;
}

const DEFAULT_FALLBACKS: Record<string, string[]> = {
  "royal enfield": [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
  ],
  classic: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
  ],
  activa: [
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
  ],
};

function getEffectivePhotos(photos: string[] | undefined, altText: string): string[] {
  if (photos && photos.length > 0) {
    return photos.map(resolvePhotoUrl);
  }
  const lower = altText.toLowerCase();
  for (const [key, list] of Object.entries(DEFAULT_FALLBACKS)) {
    if (key !== "default" && lower.includes(key)) {
      return list;
    }
  }
  return DEFAULT_FALLBACKS.default;
}

export function VehicleGallery({
  photos,
  altText,
}: {
  photos?: string[];
  altText: string;
}) {
  const displayPhotos = getEffectivePhotos(photos, altText);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  function prev() {
    setActiveIndex((p) => (p === 0 ? displayPhotos.length - 1 : p - 1));
  }

  function next() {
    setActiveIndex((p) => (p === displayPhotos.length - 1 ? 0 : p + 1));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Main Image Frame */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "440px",
          backgroundColor: "#4E050E",
          overflow: "hidden",
          border: "1px solid rgba(249, 211, 205, 0.25)",
        }}
      >
        <img
          src={displayPhotos[activeIndex]}
          alt={`${altText} - photo ${activeIndex + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            cursor: "pointer",
          }}
          onClick={() => setIsZoomOpen(true)}
        />

        {/* Counter Tag */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            backgroundColor: "#F9D3CD",
            color: "#680A16",
            padding: "6px 14px",
            fontSize: "0.8125rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {activeIndex + 1} / {displayPhotos.length}
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "rgba(78, 5, 14, 0.9)",
            color: "#F9D3CD",
            border: "1px solid rgba(249, 211, 205, 0.35)",
            padding: "8px 16px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          Zoom View [↗]
        </button>

        {/* Navigation arrows */}
        {displayPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(78, 5, 14, 0.85)",
                color: "#F9D3CD",
                border: "1px solid rgba(249, 211, 205, 0.3)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.125rem",
              }}
              aria-label="Previous photo"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(78, 5, 14, 0.85)",
                color: "#F9D3CD",
                border: "1px solid rgba(249, 211, 205, 0.3)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.125rem",
              }}
              aria-label="Next photo"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {displayPhotos.length > 1 && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {displayPhotos.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              style={{
                position: "relative",
                width: "90px",
                height: "60px",
                flexShrink: 0,
                overflow: "hidden",
                border: activeIndex === idx ? "2px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.25)",
                backgroundColor: "#4E050E",
                padding: 0,
                cursor: "pointer",
                opacity: activeIndex === idx ? 1 : 0.5,
              }}
            >
              <img
                src={photo}
                alt={`Thumbnail ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isZoomOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(54, 2, 8, 0.96)",
            padding: "24px",
          }}
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "1080px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", color: "#F9D3CD" }}>
              <span style={{ fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                {altText} ({activeIndex + 1} of {displayPhotos.length})
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={prev}
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="btn-primary"
                  style={{ padding: "8px 18px", fontSize: "0.875rem" }}
                >
                  Close [✕]
                </button>
              </div>
            </div>

            <img
              src={displayPhotos[activeIndex]}
              alt={`${altText} enlarged`}
              style={{
                maxHeight: "75vh",
                width: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
                border: "1px solid rgba(249, 211, 205, 0.2)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
