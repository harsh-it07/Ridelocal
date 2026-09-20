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
    "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=80",
  ],
  classic: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
  ],
  activa: [
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
  ],
  honda: [
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
  ],
  scooter: [
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
  ],
  pulsar: [
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
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
    setActiveIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
  }

  function next() {
    setActiveIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="group relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-glass-border shadow-glass">
        <img
          src={displayPhotos[activeIndex]}
          alt={`${altText} - photo ${activeIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Photo Counter Pill */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
          <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{activeIndex + 1} / {displayPhotos.length}</span>
        </div>

        {/* Zoom Lightbox Button */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white/90 backdrop-blur-md transition hover:bg-black/80 hover:text-white"
          title="View fullscreen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Previous Button */}
        {displayPhotos.length > 1 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/80 hover:scale-110"
            aria-label="Previous photo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {displayPhotos.length > 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/80 hover:scale-110"
            aria-label="Next photo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnails Row */}
      {displayPhotos.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {displayPhotos.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-18 w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                activeIndex === idx
                  ? "border-brand-500 shadow-lg scale-102 ring-2 ring-brand-500/30"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={photo} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              {activeIndex === idx && (
                <div className="absolute inset-0 border-2 border-brand-500 rounded-xl" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayPhotos[activeIndex]}
              alt={`${altText} enlarged`}
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
            <div className="flex items-center justify-between p-4 bg-neutral-950/80 text-white">
              <span className="text-sm font-medium">
                {altText} ({activeIndex + 1} of {displayPhotos.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
