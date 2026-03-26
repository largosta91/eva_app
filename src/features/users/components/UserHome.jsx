// src/features/users/components/UserHome.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import ChatScreen from '../../chat/components/ChatScreen';
import PaywallGate from '../../wallet/components/PaywallGate';

const GIRLS = [
  { name:"Valentina", age:21, emoji:"🌺", tags:["Empática","Cálida"],      vip:true,  online:true,  img:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { name:"Camila",    age:24, emoji:"🦋", tags:["Música","Creativa"],      vip:false, online:true,  img:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80" },
  { name:"Sol",       age:19, emoji:"🌙", tags:["Literatura","Tranquila"], vip:true,  online:false, img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" },
  { name:"Sofía",     age:22, emoji:"✨", tags:["Energética","Optimista"], vip:false, online:true,  img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80" },
  { name:"Lucía",     age:25, emoji:"🌸", tags:["Paciente","Amorosa"],     vip:true,  online:true,  img:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80" },
];

const AI_REPLIES = [
  "Qué lindo que me escribas 💜 ¿cómo fue tu día?",
  "Te escucho, contame más 🌸",
  "Eso suena difícil... estoy acá 💫",
  "Me alegra que hablemos ✨",
  "¿Y vos qué necesitás ahora mismo?",
  "Tengo todo el tiempo para vos 🌺",
];

const ANIM_CSS = `
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes ty{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
  @keyframes gift-pop-in{0%{transform:translate(-50%,-50%) scale(0) rotate(-15deg);opacity:0}60%{transform:translate(-50%,-50%) scale(1.2) rotate(5deg);opacity:1}100%{transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1}}
  @keyframes gift-pop-out{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
  @keyframes gift-name-in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
`;



function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 2000);
    const t2 = setTimeout(() => onDone?.(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(0,0,0,0.45)", pointerEvents:"none" }} />
      <div style={{
        position:"fixed", top:"50%", left:"50%", zIndex:61,
        display:"flex", flexDirection:"column", alignItems:"center", gap:"12px", pointerEvents:"none",
        animation: phase === "in"
          ? "gift-pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : "gift-pop-out 0.5s ease-in forwards",
      }}>
        <span style={{ fontSize:"120px", lineHeight:1, filter:`drop-shadow(0 0 40px ${gift.color})` }}>
          {gift.emoji}
        </span>
        <div style={{
          background:`${gift.color}22`, border:`1px solid ${gift.color}88`,
          borderRadius:"24px", padding:"6px 20px", color:"#fff",
          fontSize:"16px", fontWeight:600, animation:"gift-name-in 0.4s ease-out 0.3s both",
        }}>
          {gift.name}
        </div>
      </div>
    </>
  );
}

export default function UserHome() {
  const navigate  = useNavigate();
  const { credits, spendCredits, logout } = useAppStore();
  const [tab, setTab]                   = useState('home');
  const [selectedGirl, setSelectedGirl] = useState(null);

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = ANIM_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.SPLASH);
  };

  if (selectedGirl) {
    return (
      <ChatScreen
        girl={selectedGirl}
        onBack={() => setSelectedGirl(null)}
        credits={credits}
        onSpend={(n) => spendCredits(n)}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-[#09080f] text-[#ede8ff] flex flex-col overflow-hidden">
      <div className="grid grid-cols-3 items-center py-3.5 px-5 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">
        <div></div>
        <span className="font-serif text-3xl font-semibold bg-gradient-to-br from-[#8b3a9c] to-[#c9a84c] bg-clip-text text-transparent text-center whitespace-nowrap">
          Eva
        </span>
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-full py-2 px-4 text-sm font-medium text-[#c9a84c] cursor-pointer">
            💎 {credits}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'home'    && <HomeTab onSelectGirl={setSelectedGirl} />}
        {tab === 'credits' && <PaywallGate />}
        {tab === 'profile' && <ProfileTab onLogout={handleLogout} setTab={setTab} />}
      </div>

      <div className="flex bg-[#111018] border-t border-[rgba(201,168,76,.14)] pt-2.5 pb-5 shrink-0">
        {[
          { key:'home',    icon:'🔥', label:'Explorar' },
          { key:'credits', icon:'👑', label:'Premium'  },
          { key:'profile', icon:'👤', label:'Perfil'   },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors duration-200 ${tab === t.key ? 'text-[#c9a84c]' : 'text-[#7a748f]'}`}
          >
            <span className="text-2xl">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeTab({ onSelectGirl }) {
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


function ProfileTab({ onLogout }) {
  const { credits } = useAppStore();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    // pt-5 para subir todo el contenido
    <div className="px-6 pt-5 pb-32 flex flex-col overflow-y-auto animate-fadeIn">

      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-[#1a1826] border-2 border-[#c9a84c] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-5xl">👤</span>
            }
          </div>
          <label className="absolute bottom-1 right-1 bg-[#c9a84c] text-[#09080f] w-8 h-8 rounded-full border-2 border-[#09080f] flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-semibold text-[#ede8ff]">Usuario</h2>
            <button className="text-[#7a748f] text-sm">✏️</button>
          </div>
          <p className="text-[#7a748f] text-[11px] uppercase tracking-[3px] mt-1 font-bold">Mi Perfil</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1a1826] to-[#111018] border border-[rgba(201,168,76,0.2)] rounded-3xl p-6 mb-3 flex items-center justify-between shadow-xl">
        <div>
          <p className="text-[#7a748f] text-xs uppercase font-bold tracking-wider">Diamantes</p>
          <p className="text-3xl font-bold text-[#c9a84c] mt-1">💎 {credits}</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.PAYWALL)}
          className="bg-[#c9a84c] text-[#09080f] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(201,168,76,0.3)] active:scale-95 transition-transform cursor-pointer"
        >
          CARGAR
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button className="w-full bg-[#1a1826] border border-[rgba(201,168,76,0.1)] py-5 px-6 rounded-2xl flex items-center justify-between group active:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🎧</span>
            <div className="text-left">
              <p className="text-[#ede8ff] text-[16px] font-semibold">Soporte Técnico</p>
              <p className="text-[#7a748f] text-xs">Reportar problemas con pagos</p>
            </div>
          </div>
          <span className="text-[#5a5470] text-xl">›</span>
        </button>

        <button
          onClick={onLogout}
          className="mt-4 w-full py-4 text-[#5a5470] text-[13px] font-medium hover:text-red-400 transition-colors cursor-pointer"
        >
          Cerrar sesión segura
        </button>
      </div>

      <p className="mt-8 text-[9px] text-[#423d57] text-center uppercase tracking-[3px]">
        Eva App v1.0.2
      </p>
    </div>
  );
}
