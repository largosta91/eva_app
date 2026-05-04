// src/hooks/useAuth.js
import { useNavigate } from 'react-router-dom';
import useAppStore from '../app/store/useAppStore';
import { supabase } from '../services/api/supabase';
import { ROUTES } from '../constants/routes';

export function useAuth() {
  const { user, isLoggedIn, isLoading, logout: storeLogout } = useAppStore();
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    storeLogout();
    navigate(ROUTES.SPLASH);
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    role: user?.role ?? null,
    isCreator: user?.role === 'creator',
    isUser: user?.role === 'user',
    logout,
  };
}