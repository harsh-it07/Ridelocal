import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import { Loader } from "../components/Loader";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#680A16", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader message="Authenticating session..." size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
