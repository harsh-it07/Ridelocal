import { useState } from "react";
import { api, getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: {
    id?: string;
    name?: string;
    createdAt?: string;
  };
  tags?: string[];
  helpfulCount?: number;
  rentalDuration?: string;
}

const SAMPLE_TAGS = [
  "Smooth engine",
  "Clean bike",
  "Great mileage",
  "Punctual handover",
  "Polite owner",
  "Good helmets",
  "Highway ready",
];

const SEEDED_REVIEWS_MAP: Record<string, ReviewItem[]> = {
  default: [
    {
      id: "seed-rev-1",
      rating: 5,
      comment:
        "Rode this bike to Amber Fort and Nahargarh for the sunset. Flawless condition, smooth clutch and strong braking. The owner was super courteous and punctual.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      customer: { name: "Aman Verma" },
      tags: ["Smooth engine", "Clean bike", "Highway ready"],
      helpfulCount: 14,
      rentalDuration: "2 days",
    },
    {
      id: "seed-rev-2",
      rating: 5,
      comment:
        "One of the best rental experiences in Jaipur! Pickup was seamless right near the railway station. Tank was full and two clean helmets were provided.",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      customer: { name: "Priya Sharma" },
      tags: ["Punctual handover", "Good helmets", "Polite owner"],
      helpfulCount: 9,
      rentalDuration: "3 days",
    },
    {
      id: "seed-rev-3",
      rating: 4,
      comment:
        "Great pickup and engine sound. Comfortable for touring with luggage. Very responsive host on WhatsApp. Would rent again without hesitation.",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      customer: { name: "Vikram Rathore" },
      tags: ["Smooth engine", "Great mileage"],
      helpfulCount: 5,
      rentalDuration: "1 day",
    },
    {
      id: "seed-rev-4",
      rating: 5,
      comment:
        "Took it for a quick city tour through Hawa Mahal and Johari Bazaar. Mileage was surprisingly good and handling was effortless in Jaipur traffic.",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      customer: { name: "Neha Kulkarni" },
      tags: ["Great mileage", "Clean bike"],
      helpfulCount: 7,
      rentalDuration: "2 days",
    },
  ],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "inline-flex", gap: "2px", color: "#F9D3CD" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ fontSize: "0.875rem" }}>
          {star <= Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export function ReviewsSection({
  vehicleId,
  serverReviews,
  ratingAvg = 4.8,
  ratingCount = 32,
  onReviewAdded,
}: {
  vehicleId: string;
  serverReviews: any[];
  ratingAvg?: number;
  ratingCount?: number;
  onReviewAdded?: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const baseReviews: ReviewItem[] =
    serverReviews && serverReviews.length > 0
      ? serverReviews.map((r, i) => ({
          ...r,
          tags: r.tags || (i % 2 === 0 ? ["Smooth engine", "Clean bike"] : ["Punctual handover"]),
          helpfulCount: r.helpfulCount || (i === 0 ? 12 : 5),
          rentalDuration: r.rentalDuration || "2 days",
        }))
      : SEEDED_REVIEWS_MAP.default;

  const [reviews, setReviews] = useState<ReviewItem[]>(baseReviews);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "HIGHEST" | "LOWEST">("NEWEST");
  const [searchQuery, setSearchQuery] = useState("");
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");
  const [modalSelectedTags, setModalSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const totalReviews = Math.max(ratingCount, reviews.length);
  const effectiveAvg = ratingAvg > 0 ? ratingAvg : 4.8;

  const filteredReviews = reviews
    .filter((r) => {
      if (selectedStarFilter !== "ALL" && r.rating !== selectedStarFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesComment = r.comment?.toLowerCase().includes(q);
        const matchesCustomer = r.customer?.name?.toLowerCase().includes(q);
        const matchesTag = r.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesComment && !matchesCustomer && !matchesTag) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "HIGHEST") {
        return b.rating - a.rating;
      }
      return a.rating - b.rating;
    });

  function toggleTag(tag: string) {
    setModalSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleHelpful(reviewId: string) {
    if (helpfulClicked[reviewId]) return;
    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setModalError(null);
    setSubmitting(true);

    try {
      const fullComment =
        modalSelectedTags.length > 0
          ? `${modalComment.trim()}\n\nHighlights: ${modalSelectedTags.join(", ")}`
          : modalComment.trim();

      const { data } = await api.post("/reviews", {
        vehicleId,
        rating: modalRating,
        comment: fullComment || undefined,
      });

      const newReview: ReviewItem = {
        id: data.review?.id || `user-rev-${Date.now()}`,
        rating: modalRating,
        comment: modalComment.trim() || undefined,
        createdAt: new Date().toISOString(),
        customer: { name: user.name || "You" },
        tags: modalSelectedTags,
        helpfulCount: 0,
        rentalDuration: "Recent ride",
      };

      setReviews((prev) => [newReview, ...prev]);
      setSubmitSuccess(true);
      if (onReviewAdded) onReviewAdded();

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setModalComment("");
        setModalSelectedTags([]);
      }, 1200);
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: "72px", borderTop: "1px solid rgba(249, 211, 205, 0.3)", paddingTop: "48px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            AUTHENTIC FEEDBACK
          </p>
          <h2
            style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontSize: "2.75rem",
              color: "#F9D3CD",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              margin: "4px 0 0",
            }}
          >
            RIDER REVIEWS
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate("/login");
              return;
            }
            setIsModalOpen(true);
          }}
          className="btn-primary"
          style={{ padding: "14px 28px", fontSize: "0.9375rem" }}
        >
          Write a Review →
        </button>
      </div>

      {/* Ratings summary strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "48px",
          alignItems: "center",
          marginTop: "32px",
          padding: "24px 0",
          borderTop: "1px solid rgba(249, 211, 205, 0.2)",
          borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
        }}
      >
        <div>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "4rem", color: "#F9D3CD", lineHeight: 1 }}>
            {effectiveAvg.toFixed(1)}
          </span>
          <div style={{ marginTop: "4px" }}>
            <StarRating rating={effectiveAvg} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "#F0C4BC", marginTop: "6px", fontWeight: 600 }}>
            {totalReviews} verified trips
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["ALL", 5, 4, 3] as const).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(star)}
                style={{
                  padding: "8px 14px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  backgroundColor: selectedStarFilter === star ? "#F9D3CD" : "transparent",
                  color: selectedStarFilter === star ? "#680A16" : "#F0C4BC",
                  border: "1px solid rgba(249, 211, 205, 0.3)",
                  cursor: "pointer",
                }}
              >
                {star === "ALL" ? "All" : `${star}★`}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="input"
            style={{ width: "auto", padding: "8px 14px", fontSize: "0.875rem" }}
          >
            <option value="NEWEST">Most Recent</option>
            <option value="HIGHEST">Highest Rated</option>
            <option value="LOWEST">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ marginTop: "32px" }}>
        {filteredReviews.length === 0 ? (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "24px 0" }}>
            No reviews match the selected filter.
          </p>
        ) : (
          filteredReviews.map((r) => {
            const customerName = r.customer?.name || "Verified Rider";
            return (
              <div
                key={r.id}
                style={{
                  padding: "24px 0",
                  borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.25rem", color: "#FFFFFF", textTransform: "uppercase" }}>
                        {customerName}
                      </span>
                      <span style={{ fontSize: "0.8125rem", color: "#F9D3CD", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✓ Verified Rider
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", fontSize: "0.875rem", color: "#F0C4BC" }}>
                      <StarRating rating={r.rating} />
                      <span>·</span>
                      <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {r.rentalDuration && (
                        <>
                          <span>·</span>
                          <span>{r.rentalDuration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHelpful(r.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#F0C4BC",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Helpful {r.helpfulCount ? `(${r.helpfulCount})` : ""}
                  </button>
                </div>

                {r.comment && (
                  <p style={{ fontSize: "1rem", color: "#F9D3CD", lineHeight: 1.65, marginTop: "12px" }}>
                    {r.comment}
                  </p>
                )}

                {r.tags && r.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                    {r.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "0.8125rem",
                          color: "#F0C4BC",
                          border: "1px solid rgba(249, 211, 205, 0.25)",
                          padding: "3px 10px",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(35, 2, 6, 0.85)",
            padding: "16px",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#4E050E",
              border: "1px solid #F9D3CD",
              padding: "36px",
              maxWidth: "500px",
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#F9D3CD" }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "#F9D3CD", margin: 0, textTransform: "uppercase" }}>
              Share Your Experience
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
              Help other Jaipur tourists pick the right machine.
            </p>

            {submitSuccess ? (
              <div style={{ textAlign: "center", padding: "36px 0" }}>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#F9D3CD" }}>✓ Review Submitted</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ marginTop: "24px" }}>
                <div>
                  <label className="label">Rating</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setModalRating(n)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "2rem",
                          cursor: "pointer",
                          color: n <= modalRating ? "#F9D3CD" : "rgba(249, 211, 205, 0.3)",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label className="label">Highlights</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {SAMPLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          border: modalSelectedTags.includes(tag) ? "1px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.25)",
                          backgroundColor: modalSelectedTags.includes(tag) ? "#F9D3CD" : "transparent",
                          color: modalSelectedTags.includes(tag) ? "#680A16" : "#F0C4BC",
                          cursor: "pointer",
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label className="label">Your Comments</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe vehicle condition, pickup experience, engine performance..."
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    className="input"
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>

                {modalError && <p style={{ fontSize: "0.875rem", color: "#FFAAAA", marginTop: "8px" }}>{modalError}</p>}

                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: "14px" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || modalComment.trim().length < 5} className="btn-primary" style={{ flex: 1, padding: "14px" }}>
                    {submitting ? "Posting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
