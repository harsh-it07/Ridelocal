import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";

export function AvailabilityPage() {
  const { id } = useParams();
  const [slots, setSlots] = useState<any[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get(`/vehicles/${id}/availability`).then(({ data }) => setSlots(data.slots));
  }

  useEffect(load, [id]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/vehicles/${id}/availability`, {
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        status: "OPEN",
      });
      setStart("");
      setEnd("");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(slotId: string) {
    await api.delete(`/vehicles/${id}/availability/${slotId}`);
    load();
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        SCHEDULE MANAGEMENT
      </p>
      <h1
        style={{
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
          fontSize: "clamp(3rem, 7vw, 5rem)",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          color: "#F9D3CD",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}
      >
        AVAILABILITY SLOTS.
      </h1>
      <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px", fontWeight: 500 }}>
        Define active calendar availability windows for pickup & handover in Jaipur.
      </p>

      {/* Add Slot Form in Wine Box */}
      <form
        onSubmit={handleAdd}
        style={{
          marginTop: "40px",
          border: "1px solid rgba(249, 211, 205, 0.25)",
          backgroundColor: "#4E050E",
          padding: "28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "18px",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label className="label">Window Start</label>
          <input
            type="datetime-local"
            className="input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label className="label">Window End</label>
          <input
            type="datetime-local"
            className="input"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: "14px 28px", whiteSpace: "nowrap" }}
        >
          Add Window →
        </button>
      </form>

      {error && <p style={{ fontSize: "0.875rem", color: "#FFAAAA", marginTop: "12px" }}>{error}</p>}

      {/* Slots List */}
      <div style={{ marginTop: "32px" }}>
        {slots.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
            }}
          >
            <div>
              <p style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.375rem", color: "#FFFFFF", textTransform: "uppercase", margin: 0 }}>
                {new Date(s.startTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px", fontWeight: 500 }}>
                until {new Date(s.endTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              style={{
                background: "none",
                border: "none",
                color: "#FFAAAA",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Remove [✕]
            </button>
          </div>
        ))}

        {slots.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "28px 0" }}>
            No explicit availability windows defined. Default calendar booking rules apply.
          </p>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
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
    </div>
  );
}
