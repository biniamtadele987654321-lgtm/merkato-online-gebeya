import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles, unauthorizedTo = '/' }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Checking your account…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={unauthorizedTo} replace state={{ requiredRole: roles[0] }} />;
  }
  return <Outlet />;
}
