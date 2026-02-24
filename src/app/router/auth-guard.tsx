import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStoredAuthAccessKey } from '@/services/api/auth.service';

/**
 * Wraps all authenticated /app/* routes.
 * If no access key is stored, redirects to login preserving the intended URL.
 */
export function AuthGuard() {
  const location = useLocation();
  const accessKey = getStoredAuthAccessKey();

  if (!accessKey) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
