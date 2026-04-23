import { useEffect, useState } from 'react';
import { ANIM_CSS } from '../../../constants/girlsData';
import { supabase } from '../../../services/api/supabase';

function CreatorCard({ g, onSelectGirl }) {
  const [flipped, setFlipped] = useState(false);
  const hasCover = !!g.cover_url;

  return (
    <div
      key={g.id}
      onPointerDown={() => hasCover && setFlipped(true)}
      onPointerUp={() => setFlipped(false)}
      onPointerLeave={() => setFlipped(false)}
      onClick={() => onSelectGirl({ id: g.id, name: g.display_name, img: g.avatar_url })}
      className="rounded-[20px] overflow-hidden bg-[#1a1826] border border-[rgba(201,168,76,.14)] aspect-[3/4] relative cursor-pointer hover:scale-[1.02]"
      style={{ transition: 'transform 0.2s' }}
    >
      <img
        src={flipped && hasCover ? g.cover_url : g.avatar_url}
        alt={g.display_name}
        className="w-full h-full object-cover block"
        style={{ transition: 'opacity 0.2s' }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <div className="font-serif text-xl font-semibold text-white mb-0.5">
          {g.display_name}
        </div>
        {hasCover && (
          <div className="text-[10px] text-white/50">Mantené para ver más</div>
        )}
      </div>
    </div>
  );
}

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
      .select('id, display_name, avatar_url, cover_url')
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