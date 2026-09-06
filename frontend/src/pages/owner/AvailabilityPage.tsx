import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Availability manager</h1>
      <p className="mt-1 text-sm text-ink-500">
        Bookings are still checked for conflicts by the server regardless of these slots — this
        is a helper for you to communicate open windows.
      </p>

      <form className="card mt-5 flex flex-wrap items-end gap-3 p-4" onSubmit={handleAdd}>
        <div>
          <label className="label">From</label>
          <input
            type="datetime-local"
            className="input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            type="datetime-local"
            className="input"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Add slot
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 space-y-2">
        {slots.map((s) => (
          <div key={s.id} className="card flex items-center justify-between p-3 text-sm">
            <span>
              {new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}
            </span>
            <button onClick={() => handleDelete(s.id)} className="text-red-600 font-medium">
              Remove
            </button>
          </div>
        ))}
        {slots.length === 0 && <p className="text-ink-500">No availability slots added yet.</p>}
      </div>
    </div>
  );
}
