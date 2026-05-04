// src/hooks/useCredits.js
import useAppStore from '../app/store/useAppStore';
import { supabase } from '../services/api/supabase';

export function useCredits() {
  const { user, credits, setCredits, spendCredits, addCredits } = useAppStore();

  // Refresca créditos desde Supabase manualmente si hace falta
  const refresh = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();
    if (data) setCredits(data.credits);
  };

  return {
    credits,
    spendCredits,
    addCredits,
    refresh,
    hasEnough: (n) => credits >= n,
  };
}