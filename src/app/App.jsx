import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { getRecruiterToken, saveRecruiterToken } from '../utils/tokenUtils';
import useAppStore from './store/useAppStore';
import { supabase } from '../services/api/supabase';
import ProtectedRoute from '../components/common/ProtectedRoute';
import SplashScreen from '../features/auth/components/SplashScreen';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import VerifyScreen from '../features/auth/components/VerifyScreen';
import PaywallGate from '../features/wallet/components/PaywallGate';
import UserHome from '../features/users/components/UserHome';
import CreatorHome from '../features/creators/components/CreatorHome';
import JoinCreator from '../features/auth/components/JoinCreator';
import CreatorChatScreen from '../features/creators/components/CreatorChatScreen';
import CreatorVideoCall from '../features/creators/components/CreatorVideoCall';
import TermsOfService from '../components/common/TermsOfService';
import PrivacyPolicy from '../components/common/PrivacyPolicy';

function Placeholder({ name }) {
  return (
    <div className="h-screen bg-[#09080f] flex items-center justify-center text-[#c9a84c] font-serif text-2xl">
      {name}
    </div>
  );
}

export default function App() {
  const { isLoggedIn, isLoading, user, setUser, setLoading } = useAppStore();

  useEffect(() => {
    const token = getRecruiterToken();
    if (token) saveRecruiterToken(token);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('SESSION:', session);
        
        if (session?.user) {
          console.log('SESSION ID:', session.user.id);
          
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('PROFILE:', profile);
          console.log('ERROR:', error);

          if (profile) {
            setUser({ 
              id:           profile.id, 
              name:         profile.display_name,
              display_name: profile.display_name,
              role:         profile.role,
              avatar_url:   profile.avatar_url || null,
              cover_url:    profile.cover_url || null,
              verification_status: profile.verification_status || 'none',
            });
          }
        }
      } catch (err) {
        console.error('ERROR EN AUTH:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

   const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) return (
    <div className="h-screen bg-[#09080f] flex items-center justify-center">
      <span className="font-serif text-4xl text-[#c9a84c] animate-pulse">Eva</span>
    </div>
  );

  const getDefaultHome = () => {
    if (!isLoggedIn || !user) return ROUTES.SPLASH;
    return user.role === ROLES.CREATOR ? ROUTES.CREATOR_HOME : ROUTES.USER_HOME;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-[400px] h-screen overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,.8)]">
          <Routes>
            <Route path={ROUTES.SPLASH}   element={<SplashScreen />} />
            <Route path={ROUTES.LOGIN}    element={<LoginForm />} />
            <Route path={ROUTES.REGISTER} element={<RegisterForm />} />
            <Route path={ROUTES.VERIFY}   element={<VerifyScreen />} />
            <Route path={ROUTES.JOIN}     element={<JoinCreator />} />
            <Route path={ROUTES.PAYWALL}  element={<PaywallGate />} />

            {/* ✅ Rutas legales */}
            <Route path="/terms"   element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path={ROUTES.USER_HOME}    element={<ProtectedRoute requiredRole={ROLES.USER}><UserHome /></ProtectedRoute>} />
            <Route path={ROUTES.USER_CREDITS} element={<ProtectedRoute requiredRole={ROLES.USER}><Placeholder name="Créditos" /></ProtectedRoute>} />
            <Route path={ROUTES.USER_PROFILE} element={<ProtectedRoute requiredRole={ROLES.USER}><Placeholder name="Perfil Usuario" /></ProtectedRoute>} />
            <Route path={ROUTES.USER_CHAT}    element={<ProtectedRoute requiredRole={ROLES.USER}><Placeholder name="Chat" /></ProtectedRoute>} />

            <Route path={ROUTES.CREATOR_HOME}    element={<ProtectedRoute requiredRole={ROLES.CREATOR}><CreatorHome /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_CHAT}    element={<ProtectedRoute requiredRole={ROLES.CREATOR}><CreatorChatScreen /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_CALL}    element={<ProtectedRoute requiredRole={ROLES.CREATOR}><CreatorVideoCall /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_EARN}    element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Ganancias" /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_PROFILE} element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Perfil Creadora" /></ProtectedRoute>} />
            <Route path={ROUTES.CREATOR_VERIFY}  element={<ProtectedRoute requiredRole={ROLES.CREATOR}><Placeholder name="Verificación KYC" /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={getDefaultHome()} replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}