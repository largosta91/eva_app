// src/features/users/components/UserHome.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import VideoCall from '../../calls/components/VideoCall';
import GiftPanel from '../../chat/components/GiftPanel';

// ─── DATA ────────────────────────────────────────────────
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

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
};

// ── Overlay animación regalo ────────────────────────────────
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

// ══════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════
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

      {/* TOP BAR */}
      <div className="flex items-center justify-between py-3.5 px-5 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">
        <span className="text-xl cursor-pointer text-[#7a748f]">☰</span>
        <span className="font-serif text-3xl font-semibold bg-gradient-to-br from-[#c9a84c] to-[#f0d882] bg-clip-text text-transparent">Eva</span>
        <div className="flex items-center gap-1.5 bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-full py-2 px-4 text-sm font-medium text-[#c9a84c] cursor-pointer">
          💎 {credits}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'home'    && <HomeTab onSelectGirl={setSelectedGirl} />}
        {tab === 'credits' && <CreditsTab />}
        {tab === 'profile' && <ProfileTab onLogout={handleLogout} />}
      </div>

      {/* TAB BAR */}
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

// ══════════════════════════════════════════════════════════
//  HOME TAB
// ══════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════
//  CREDITS TAB
// ══════════════════════════════════════════════════════════
function CreditsTab() {
  const { credits, addCredits } = useAppStore();
  const [sel, setSel] = useState(null);

  const packs = [
    { id:1, credits:100,  price:'$4.99',  label:'Starter', bonus:null,         best:false },
    { id:2, credits:300,  price:'$9.99',  label:'Popular', bonus:'+50 gratis',  best:true  },
    { id:3, credits:700,  price:'$19.99', label:'Premium', bonus:'+200 gratis', best:false },
    { id:4, credits:1500, price:'$39.99', label:'Elite',   bonus:'+600 gratis', best:false },
  ];

  const buy = () => {
    if (!sel) return;
    const p = packs.find(x => x.id === sel);
    const bonus = p.bonus ? parseInt(p.bonus) : 0;
    addCredits(p.credits + bonus);
    setSel(null);
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="font-serif text-2xl font-semibold text-center mb-1 text-[#ede8ff]">Créditos</div>
      <div className="text-sm text-[#7a748f] text-center mb-6">Saldo actual: 💎 {credits}</div>

      <div className="flex flex-col gap-3 mb-6">
        {packs.map(p => (
          <div
            key={p.id}
            onClick={() => setSel(p.id)}
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${sel === p.id ? 'border-[#c9a84c] bg-[rgba(201,168,76,.08)]' : 'border-[rgba(201,168,76,.14)] bg-[#1a1826]'}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#ede8ff] text-[15px]">{p.label}</span>
                {p.best && <span className="bg-[#c9a84c] text-[#09080f] text-[10px] font-bold px-2 py-0.5 rounded-full">MÁS POPULAR</span>}
              </div>
              <div className="text-sm text-[#7a748f] mt-0.5">
                💎 {p.credits} créditos {p.bonus && <span className="text-green-400">{p.bonus}</span>}
              </div>
            </div>
            <div className="text-[#c9a84c] font-semibold text-[16px]">{p.price}</div>
          </div>
        ))}
      </div>

      <button
        onClick={buy}
        disabled={!sel}
        className={`w-full py-4 rounded-full font-semibold text-[15px] border-none transition-all duration-200 ${sel ? 'bg-gradient-to-r from-[#c9a84c] to-[#f0d882] text-[#09080f] cursor-pointer shadow-[0_8px_30px_rgba(201,168,76,.3)]' : 'bg-[#1a1826] text-[#7a748f] cursor-default'}`}
      >
        {sel ? 'Comprar ahora' : 'Seleccioná un pack'}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PROFILE TAB
// ══════════════════════════════════════════════════════════
function ProfileTab({ onLogout }) {
  const items = ['🎭 Mi avatar','🔔 Notificaciones','🔒 Privacidad','💬 Soporte'];
  return (
    <div className="px-4 pt-5 pb-8 flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-[#1a1826] text-4xl flex items-center justify-center border-2 border-[#c9a84c]">🎩</div>
        <div className="font-serif text-2xl font-semibold text-[#ede8ff]">Mi Perfil</div>
        <div className="text-sm text-[#7a748f]">Miembro desde 2024</div>
      </div>

      <div className="bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-2xl overflow-hidden">
        {items.map((item, i) => (
          <div key={item} className={`flex items-center justify-between px-4 py-4 cursor-pointer ${i < items.length - 1 ? 'border-b border-[rgba(201,168,76,.14)]' : ''}`}>
            <span className="text-[15px] text-[#ede8ff]">{item}</span>
            <span className="text-[#7a748f] text-lg">›</span>
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3.5 bg-transparent border border-[rgba(201,168,76,.14)] rounded-full text-[#7a748f] text-[15px] cursor-pointer"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CHAT SCREEN
// ══════════════════════════════════════════════════════════
function ChatScreen({ girl, onBack, credits, onSpend }) {
  const [messages, setMessages] = useState([
    { who:'them', text:`Hola 😊 Soy ${girl.name}, ¿cómo estás hoy?`, time:nowTime() }
  ]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [showVC, setShowVC]     = useState(false);
  const [showGifts, setShowGifts] = useState(false);   // ⭐ nuevo
  const [activeGift, setActiveGift] = useState(null);  // ⭐ nuevo
  const aiRef     = useRef(0);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const t = nowTime();
    setMessages(m => [...m, { who:'me', text:input, time:t }]);
    setInput('');
    onSpend(2);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { who:'them', text:AI_REPLIES[aiRef.current % AI_REPLIES.length], time:t }]);
      aiRef.current++;
    }, 1800);
  };

  // ⭐ nuevo — manejo de regalo
  const handleGiftSend = (gift) => {
    const t = nowTime();
    setMessages(m => [...m, {
      who: 'me',
      text: `${gift.emoji} ${gift.name}`,
      time: t,
      isGift: true,
      giftColor: gift.color,
    }]);
    onSpend(gift.cost);
    setActiveGift(gift);
    setShowGifts(false);
  };

  if (showVC) return (
    <VideoCall
      creator={{ id: girl.name, name: girl.name, avatar: girl.img }}
      user={{ id: 'user', name: 'Vos', credits: credits }}
      onEnd={() => setShowVC(false)}
      theme="dark"
    />
  );

  return (
    <div className="flex flex-col h-screen bg-[#09080f]" style={{ position: "relative" }}>

      {/* ⭐ Overlay animación regalo */}
      {activeGift && (
        <GiftOverlay gift={activeGift} onDone={() => setActiveGift(null)} />
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3 py-3.5 px-4 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">
        <button onClick={onBack} className="bg-transparent border-none text-[#ede8ff] text-2xl cursor-pointer leading-none">←</button>
        <img src={girl.img} alt={girl.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#c9a84c]" />
        <div className="flex-1">
          <div className="font-semibold text-base text-[#ede8ff]">{girl.name}</div>
          <div className="text-xs text-green-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{ animation:'blink 1.5s infinite' }} />
            En línea
          </div>
        </div>
        <button
          onClick={() => setShowVC(true)}
          className="bg-gradient-to-br from-[#c9a84c] to-[#f0d882] border-none rounded-full py-2 px-4 text-[#09080f] text-sm font-semibold cursor-pointer flex items-center gap-1.5"
        >
          📹 Video
        </button>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}>
            {/* ⭐ burbuja regalo */}
            {m.isGift ? (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"10px 16px", borderRadius:"16px",
                background:`${m.giftColor}22`, border:`1px solid ${m.giftColor}66`,
                minWidth:"80px",
              }}>
                <span style={{ fontSize:"32px", lineHeight:1 }}>{m.text.split(" ")[0]}</span>
                <span style={{ fontSize:"11px", color: m.giftColor, fontWeight:600, marginTop:"4px" }}>
                  {m.text.split(" ").slice(1).join(" ")}
                </span>
              </div>
            ) : (
              <div className={`py-3 px-4 rounded-[20px] text-sm leading-relaxed ${m.who === 'me' ? 'bg-gradient-to-br from-[#c9a84c] to-[#f0d882] text-[#09080f] rounded-br-[4px]' : 'bg-[#1a1826] text-[#ede8ff] rounded-bl-[4px]'}`}>
                {m.text}
              </div>
            )}
            <div className={`text-[11px] text-[#7a748f] mt-1 px-1 ${m.who === 'me' ? 'text-right' : 'text-left'}`}>{m.time}</div>
          </div>
        ))}
        {typing && (
          <div className="self-start bg-[#1a1826] rounded-[20px] rounded-bl-[4px] py-3.5 px-4 flex gap-1 items-center">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#7a748f] inline-block" style={{ animation:'ty 1.2s infinite', animationDelay:`${i * .2}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="text-center p-1.5 text-xs text-[#7a748f] bg-[#111018] border-t border-[rgba(201,168,76,.14)]">
        💎 {credits} créditos · −2 por mensaje
      </div>

      {/* ⭐ Gift Panel */}
      {showGifts && (
        <GiftPanel
          context="chat"
          onSend={handleGiftSend}
          onClose={() => setShowGifts(false)}
        />
      )}

      {/* INPUT */}
      <div className="py-2.5 px-3.5 pb-5 bg-[#111018] border-t border-[rgba(201,168,76,.14)] flex gap-2.5 items-center shrink-0">
        {/* ⭐ Botón regalos */}
        <button
          onClick={() => setShowGifts(g => !g)}
          style={{
            background: showGifts ? "rgba(201,168,76,.3)" : "rgba(255,255,255,.08)",
            border: showGifts ? "1px solid rgba(201,168,76,.6)" : "1px solid rgba(255,255,255,.1)",
            borderRadius:"50%", width:"40px", height:"40px",
            fontSize:"18px", cursor:"pointer", flexShrink:0,
          }}
        >
          🎁
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Escribí algo..."
          className="flex-1 bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-full py-3 px-4 text-[#ede8ff] text-sm outline-none"
        />
        <button
          onClick={send}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#f0d882] border-none text-[#09080f] text-lg cursor-pointer flex items-center justify-center"
        >
          ➤
        </button>
      </div>
    </div>
  );
}