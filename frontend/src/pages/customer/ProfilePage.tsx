import { FormEvent, useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await api.patch("/users/me", { name, phone: phone || undefined });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Your profile</h1>

      <div className="card mt-5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-ink-500">Verification status</span>
          <StatusBadge status={user.verificationStatus} />
        </div>
        {user.verificationStatus !== "VERIFIED" && (
          <Link to="/verification" className="text-sm font-medium text-brand-600">
            Complete identity verification →
          </Link>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSave}>
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-neutral-50" value={user.email} disabled />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-green-600">Profile updated.</p>}

          <button type="submit" className="btn-primary w-full">
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
