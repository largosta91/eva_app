import { useEffect, useState } from 'react';
import { ANIM_CSS } from '../../../constants/girlsData';
import { supabase } from '../../../services/api/supabase';

export default function HomeTab({ onSelectGirl }) {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = ANIM_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    // Solo creadoras con foto
    supabase
      .from('users')
      .select('id, display_name, avatar_url, is_online')
      .eq('role', 'creator')
      .not('avatar_url', 'is', null)
      .then(({ data }) => { if (data) setCreators(data); });
  }, []);

  return (
    <div className="pt-5 px-4 pb-8">
      <div className="bg-gradient-to-br from-[#8b3a9c] to-[#c9a84c] rounded-3xl py-5 px-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
        <div className="text-xs text-white/70 uppercase tracking-widest mb-1.5">Bienvenido</div>
        <div className="font-serif text-2xl font-semibold text-white leading-tight mb-1">¿Tenés 2 minutos?</div>
        <div className="text-sm text-white/75">Elegí una compañera y hablá ahora.</div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" style={{ animation:'blink 1.5s infinite' }} />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7a748f]">Online ahora</span>
      </div>

      {creators.length === 0 ? (
        <div className="text-center text-[#7a748f] py-20 text-sm">No hay compañeras disponibles aún</div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {creators.map(g => (
            <div
              key={g.id}
              onClick={() => onSelectGirl({ id: g.id, name: g.display_name, img: g.avatar_url })}
              className={`rounded-[20px] overflow-hidden bg-[#1a1826] border border-[rgba(201,168,76,.14)] aspect-[3/4] relative transition-transform duration-200 ${g.is_online ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
            >
              <img src={g.avatar_url} alt={g.display_name} className="w-full h-full object-cover block" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              {!g.is_online && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-black/70 text-white/70 text-[11px] font-semibold py-1 px-3.5 rounded-full">En llamada...</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <div className="font-serif text-xl font-semibold text-white mb-0.5">{g.display_name}</div>
                <div className={`text-[11px] flex items-center gap-1.5 ${g.is_online ? 'text-green-400' : 'text-white/50'}`}>
                  {g.is_online && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
                  {g.is_online ? 'Disponible' : 'Ocupada'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}