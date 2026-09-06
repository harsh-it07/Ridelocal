import { ReactNode } from "react";

// A handful of tiny, reusable building blocks referenced throughout the
// app. Most visual identity actually lives in index.css (.card, .btn-*,
// .glass, .chip) since nearly every page already used those utility
// classes — these components exist for the states that don't map to a
// single CSS class: empty states, loading states, section containers.

export function SectionContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function EmptyState({
  icon = "🔍",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="font-display font-semibold text-ink-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="space-y-3">
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton h-24 rounded-2xl" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card border-red-200/60 bg-red-50/60 px-6 py-4 text-sm text-red-700">
      {message}
    </div>
  );
}
