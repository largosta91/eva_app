import { useEffect } from 'react';
import { GIRLS, ANIM_CSS } from '../../../constants/girlsData';

export default function HomeTab({ onSelectGirl }) {
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = ANIM_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
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

      <div className="grid grid-cols-2 gap-3.5">
        {GIRLS.map(g => (
          <div
            key={g.name}
            onClick={() => g.online && onSelectGirl(g)}
            className={`rounded-[20px] overflow-hidden bg-[#1a1826] border border-[rgba(201,168,76,.14)] aspect-[3/4] relative transition-transform duration-200 ${g.online ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
          >
            <img src={g.img} alt={g.name} className="w-full h-full object-cover block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            {!g.online && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-black/70 text-white/70 text-[11px] font-semibold py-1 px-3.5 rounded-full">En llamada...</span>
              </div>
            )}
            {g.vip && (
              <div className="absolute top-3 right-3 bg-[rgba(201,168,76,.25)] border border-[rgba(201,168,76,.5)] rounded-full py-0.5 px-2.5 text-[10px] text-[#e8c97a] font-semibold">⭐ TOP</div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <div className="font-serif text-xl font-semibold text-white mb-0.5">{g.name}, {g.age}</div>
              <div className={`text-[11px] flex items-center gap-1.5 ${g.online ? 'text-green-400' : 'text-white/50'}`}>
                {g.online && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
                {g.online ? 'Disponible' : 'Ocupada'}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {g.tags.map(t => (
                  <span key={t} className="bg-white/10 border border-white/15 rounded-full py-0.5 px-2.5 text-[10px] text-white/80">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}