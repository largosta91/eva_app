// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAppStore from '../../app/store/useAppStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, user } = useAppStore();

  // Si no está logueado, lo mando al splash
  if (!isLoggedIn || !user) {
    return <Navigate to={ROUTES.SPLASH} replace />;
  }

  // Si la ruta requiere un rol específico y no coincide
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'creator') {
      return <Navigate to={ROUTES.CREATOR_HOME} replace />;
    }
    if (user?.role === 'user') {
      return <Navigate to={ROUTES.USER_HOME} replace />;
    }
    // Si el rol está vacío o inválido, lo mando al splash
    return <Navigate to={ROUTES.SPLASH} replace />;
  }

  // Si todo coincide, renderizo el componente protegido
  return children;
}
