import { useEffect, useState } from 'react';
import { ANIM_CSS } from '../../../constants/girlsData';
import { supabase } from '../../../services/api/supabase';
import CreatorCard from './CreatorCard';


export default function HomeTab({ onSelectGirl }) {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = ANIM_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    supabase
      .from('users')
      .select('id, display_name, avatar_url, cover_url, video_url')
      .eq('role', 'creator')
      .not('avatar_url', 'is', null)
      .then(({ data }) => { if (data) setCreators([...data].sort(() => Math.random() - 0.5)); });
  }, []);

  return (
    <div className="pt-5 px-4 pb-8">
      <div className="bg-gradient-to-br from-[#8b3a9c] to-[#c9a84c] rounded-3xl py-5 px-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
        <div className="text-xs text-white/70 uppercase tracking-widest mb-1.5">Bienvenido</div>
        <div className="font-serif text-2xl font-semibold text-white leading-tight mb-1">
          Rompe la rutina, vive el instante
        </div>
        <div className="text-sm text-white/75">
          Conectá con alguien y hablá ahora.
        </div>
      </div>

      {creators.length === 0 ? (
        <div className="text-center text-[#7a748f] py-20 text-sm">
          No hay compañeras disponibles aún
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {creators.map(g => (
            <CreatorCard key={g.id} g={g} onSelectGirl={onSelectGirl} />
          ))}
        </div>
      )}
    </div>
  );
}