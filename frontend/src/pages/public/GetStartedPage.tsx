import { Link, useSearchParams } from "react-router-dom";

const OPTIONS = [
  {
    role: "CUSTOMER" as const,
    icon: "RL",
    title: "Rent a Bike",
    description:
      "Find verified local bikes and explore your destination at your own pace.",
    cta: "Continue as a tourist",
    to: "/register?role=CUSTOMER",
  },
  {
    role: "OWNER" as const,
    icon: "OW",
    title: "List Your Bike",
    description:
      "Turn your bike into an earning opportunity by renting it to verified travelers.",
    cta: "Continue as an owner",
    to: "/register?role=OWNER",
  },
  {
    role: "ADMIN" as const,
    icon: "AD",
    title: "Admin Access",
    description: "Secure platform management and operations.",
    cta: "Admin sign in",
    to: "/login?admin=1",
  },
];

export function GetStartedPage() {
  const [params] = useSearchParams();
  const highlight = params.get("role");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl text-center animate-fade-up">
        <span className="chip">Welcome to RideLocal</span>
        <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl text-ink-900">
          How would you like to get started?
        </h1>
        <p className="mt-3 text-ink-500">
          Choose the path that fits you — each one leads to a tailored setup.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {OPTIONS.map((opt, i) => (
          <div
            key={opt.role}
            className={`card card-hover flex flex-col p-7 animate-fade-up stagger-${i + 1} ${
              highlight === opt.role
                ? "ring-2"
                : ""
            }`}
            style={highlight === opt.role ? { ringColor: 'rgba(249,115,22,0.40)', borderColor: 'rgba(249,115,22,0.30)' } : {}}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold tracking-wide"
              style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}
            >
              {opt.icon}
            </div>
            <h2 className="mt-5 font-display font-bold text-ink-900">{opt.title}</h2>
            <p className="mt-2 flex-1 text-sm text-ink-500">
              {opt.description}
            </p>

            {opt.role === "ADMIN" ? (
              <>
                <Link to={opt.to} className="btn-secondary mt-6 w-full">
                  {opt.cta}
                </Link>
                <p className="mt-2 text-center text-xs text-ink-500">
                  Admin accounts are provisioned by the platform team, not created here.
                </p>
              </>
            ) : (
              <Link to={opt.to} className="btn-glass mt-6 w-full">
                {opt.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-9 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
