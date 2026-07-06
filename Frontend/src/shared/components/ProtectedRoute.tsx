import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../features/auth/hooks/useAuth';

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectTo?: string;
};

const ProtectedRoute = ({ allowedRoles, redirectTo = '/' }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


