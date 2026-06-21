import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from './useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While the initial /me check is in flight, don't redirect — a logged-in user
  // would briefly get bounced to /login on every refresh otherwise.
  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Spinner size={28} label="Loading your account" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
