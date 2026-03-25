import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAppStore from '../../app/store/useAppStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, user } = useAppStore();

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const home = user?.role === 'creator' ? ROUTES.CREATOR_HOME : ROUTES.USER_HOME;
    return <Navigate to={home} replace />;
  }

 

  return children;
}