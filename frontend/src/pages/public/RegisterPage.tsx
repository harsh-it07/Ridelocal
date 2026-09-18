import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "OWNER" ? "OWNER" : "CUSTOMER";

  const [role, setRole] = useState<"CUSTOMER" | "OWNER">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register({ name, email, phone: phone || undefined, password, role });
      if (user.role === "OWNER") navigate("/owner");
      else navigate("/search");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8 animate-scale-up">
        <h1 className="font-display text-2xl font-bold">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Rent a ride, or list your own.
        </p>

        {/* Role toggle — glass tabs */}
        <div className="mt-6 grid grid-cols-2 gap-2 p-1.5 badge">
          {(["CUSTOMER", "OWNER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2.5 text-sm font-semibold transition-all duration-250 ${role === r ? 'bg-white shadow-sm rounded-[10px] text-brand-600' : 'text-ink-500'}`}
            >
              {r === "CUSTOMER" ? "I want to rent" : "I want to list a vehicle"}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" placeholder="+91 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 8 characters"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
