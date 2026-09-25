import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isAdminEntry = params.get("admin") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === "OWNER") navigate("/owner");
      else if (user.role === "ADMIN") navigate("/admin");
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
        {isAdminEntry && (
          <div className="mb-5 badge text-ink-700">
            Admin sign in — this account must already exist; there is no admin signup.
          </div>
        )}
        <h1 className="font-display text-2xl font-bold">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Log in to find or manage your rides.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
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
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          New here?{" "}
          <Link to="/register" className="font-medium text-brand-600">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
