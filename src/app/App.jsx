import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { getRecruiterToken, saveRecruiterToken } from '../utils/tokenUtils';
import useAppStore from './store/useAppStore';
import ProtectedRoute from '../components/common/ProtectedRoute';
import SplashScreen from '../features/auth/components/SplashScreen';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import VerifyScreen from '../features/auth/components/VerifyScreen';
import PaywallGate from '../features/wallet/components/PaywallGate';
import UserHome from '../features/users/components/UserHome';
import CreatorHome from '../features/creators/components/CreatorHome';
import JoinCreator from '../features/auth/components/JoinCreator';


// Stubs temporales — los vamos reemplazando de a uno
function Placeholder({ name }) {
  return (
    <div className="h-screen bg-[#09080f] flex items-center justify-center text-[#c9a84c] font-serif text-2xl">
      {name}
    </div>
  );
}

export default function App() {
  const { isLoggedIn, isLoading, user, setLoading } = useAppStore();

  useEffect(() => {
    const token = getRecruiterToken();
    if (token) saveRecruiterToken(token);
    setLoading(false);
  }, [setLoading]);

  if (isLoading) return (
    <div className="h-screen bg-[#09080f] flex items-center justify-center">
      <span className="font-serif text-4xl text-[#c9a84c]">Eva</span>
    </div>
  );

  const defaultHome = isLoggedIn
    ? user?.role === ROLES.CREATOR ? ROUTES.CREATOR_HOME : ROUTES.USER_HOME
    : ROUTES.SPLASH;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-[400px] h-screen overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,.8)]">
          <Routes>
            <Route path={ROUTES.SPLASH}    element={<SplashScreen />} />
            <Route path={ROUTES.LOGIN}     element={<LoginForm />} />
            <Route path={ROUTES.REGISTER}  element={<RegisterForm />} />
            <Route path={ROUTES.VERIFY}    element={<VerifyScreen />} />
            <Route path={ROUTES.JOIN}      element={<JoinCreator />} />
            <Route path={ROUTES.PAYWALL}   element={<PaywallGate />} />

            <Route path={ROUTES.USER_HOME}    element={<ProtectedRoute requiredRole={ROLES.USER}><UserHome /></ProtectedRoute>} />
            <Route path={ROUTES.USER_CREDITS} element={<ProtectedRoute requiredRole={ROLES.USER}><Placeholder name="Créditos" /></ProtectedRoute>} />
            <Route path={ROUTES.USER_PROFILE} element={<ProtectedRoute requiredRole={ROLES.USER}><Placeholder name="Perfil Usuario" /></ProtectedRoute>} />
            <Route path={ROUTES.USER_CHAT}    element={<ProtectedRoute requiredRole={ROLES.USER}><Placeholder name="Chat" /></ProtectedRoute>} />

            <Route path={ROUTES.CREATOR_HOME} element={<ProtectedRoute requiredRole={ROLES.CREATOR}><CreatorHome /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_CHATS}   element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Chats Creadora" /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_EARN}    element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Ganancias" /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_PROFILE} element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Perfil Creadora" /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_VERIFY}  element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Verificación KYC" /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={defaultHome} replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}