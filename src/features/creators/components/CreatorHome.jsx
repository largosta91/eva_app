// src/features/creators/components/CreatorHome.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

const MALE_USERS = [
  { name:"Carlos",    emoji:"🎩", preview:"Hola Eva, ¿podemos hablar?",  time:"ahora", unread:true  },
  { name:"Matías",    emoji:"🧢", preview:"Tuve un día difícil, Eva...", time:"3m",    unread:true  },
  { name:"Rodrigo",   emoji:"🎭", preview:"¿Estás disponible, Eva?",     time:"12m",   unread:false },
  { name:"Sebastián", emoji:"🕹️", preview:"Gracias por ayer Eva 💜",     time:"1h",    unread:false },
];

const AI_REPLIES = [
  "Qué interesante... seguí, te escucho 💜",
  "Te entiendo perfectamente. ¿Cómo te hizo sentir eso?",
  "Eso suena muy difícil. Estoy acá sin juicios 🌸",
  "Es válido lo que sentís. Tus emociones importan 💫",
  "¿Querés contarme más? Tengo todo el tiempo 🌺",
  "Me alegra que lo hayas compartido conmigo ✨",
];

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
};

// ══════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════
export default function CreatorHome() {
  const navigate = useNavigate();
  const { logout } = useAppStore();
  const [tab, setTab]           = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.SPLASH);
  };

  if (selectedUser) {
    return <CreatorChat user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="w-full h-screen bg-[#fdf6f0] text-[#2a1a20] flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#fff9f5] border-b border-[rgba(196,96,122,.15)] shrink-0">
        <span />
        <span className="font-serif text-2xl font-semibold bg-gradient-to-r from-[#c4607a] to-[#e8a0b0] bg-clip-text text-transparent">Eva</span>
        <span />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'home'    && <FHome onSelectUser={setSelectedUser} />}
        {tab === 'chats'   && <FChats onSelectUser={setSelectedUser} />}
        {tab === 'earn'    && <FEarn />}
        {tab === 'profile' && <FProfile onLogout={handleLogout} />}
      </div>

      {/* TAB BAR */}
      <div className="flex bg-[#fff9f5] border-t border-[rgba(196,96,122,.15)] pt-2.5 pb-5 shrink-0">
        {[
          { key:'home',    icon:'🏠', label:'Inicio'    },
          { key:'chats',   icon:'💬', label:'Chats'     },
          { key:'earn',    icon:'💰', label:'Ganancias' },
          { key:'profile', icon:'👤', label:'Perfil'    },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors duration-200 ${tab === t.key ? 'text-[#c4607a]' : 'text-[#9a7a84]'}`}
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
function FHome({ onSelectUser }) {
  const [online, setOnline] = useState(true);
  const bars = [30,55,40,70,45,80,65];

  return (
    <div className="flex flex-col pb-4">
      {/* Stats header */}
      <div className="bg-[#fff9f5] border-b border-[rgba(196,96,122,.15)]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="font-serif text-2xl font-semibold">Hola, Eva 🌸</div>
            <div className="text-sm text-[#9a7a84] mt-0.5">Bienvenida de nuevo</div>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#f8dde4] text-2xl flex items-center justify-center shadow-[0_2px_12px_rgba(196,96,122,.2)]">🌺</div>
        </div>
        <div className="flex border-t border-[rgba(196,96,122,.15)]">
          {[['$47','Hoy'],['8','Chats'],['4.9⭐','Rating']].map(([v,l],i) => (
            <div key={l} className={`flex-1 text-center py-4 ${i<2?'border-r border-[rgba(196,96,122,.15)]':''}`}>
              <div className="font-serif text-2xl font-semibold text-[#c4607a]">{v}</div>
              <div className="text-[10px] text-[#9a7a84] uppercase tracking-wider mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        {/* Toggle disponible */}
        <div className="flex items-center justify-between bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl px-4 py-4">
          <div>
            <div className="font-medium text-[15px]">Disponible ahora</div>
            <div className="text-xs text-[#9a7a84] mt-0.5">Los usuarios pueden contactarte</div>
          </div>
          <button
            onClick={() => setOnline(o => !o)}
            className="w-12 h-6 rounded-full border-none cursor-pointer relative transition-colors duration-300 shrink-0"
            style={{ background: online ? '#c4607a' : '#ede0d8' }}
          >
            <span
              className="absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,.2)]"
              style={{ left: online ? 22 : 2 }}
            />
          </button>
        </div>

        {/* Ganancias */}
        <div className="bg-gradient-to-br from-[#c4607a] to-[#e8a0b0] rounded-3xl p-5 text-white">
          <div className="text-xs tracking-wider uppercase opacity-85 mb-2">Ganancias esta semana</div>
          <div className="font-serif text-5xl font-semibold leading-none mb-1">$218</div>
          <div className="text-sm opacity-80">↑ 23% más que la semana pasada</div>
          <div className="flex gap-2 items-end h-12 mt-4">
            {bars.map((h,i) => <div key={i} className="flex-1 rounded-t bg-white/25" style={{ height:`${h}%` }} />)}
          </div>
        </div>

        {/* Solicitudes */}
        <div className="text-sm font-semibold uppercase tracking-wider text-[#2a1a20] mb-1">Solicitudes nuevas</div>
        {MALE_USERS.map(u => (
          <div key={u.name} onClick={() => onSelectUser(u)} className="flex items-center gap-3.5 bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-4 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#f5ece6] text-2xl flex items-center justify-center shrink-0">{u.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[15px] mb-0.5">{u.name}</div>
              <div className="text-sm text-[#9a7a84] truncate">{u.preview}</div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="text-[11px] text-[#9a7a84]">{u.time}</div>
              {u.unread && <div className="bg-gradient-to-r from-[#c4607a] to-[#e8a0b0] rounded-full px-2.5 py-0.5 text-[11px] text-white font-medium">Nuevo</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CHATS TAB
// ══════════════════════════════════════════════════════════
function FChats({ onSelectUser }) {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2">
        {MALE_USERS.map(u => (
          <div key={u.name} onClick={() => onSelectUser(u)} className="flex items-center gap-3.5 py-3.5 border-b border-[rgba(196,96,122,.15)] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#f5ece6] text-2xl flex items-center justify-center shrink-0">{u.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-[15px]">{u.name}</span>
                <span className="text-[11px] text-[#9a7a84]">{u.time}</span>
              </div>
              <div className={`text-sm truncate ${u.unread ? 'text-[#2a1a20]' : 'text-[#9a7a84]'}`}>{u.preview}</div>
            </div>
            {u.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#c4607a] shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  EARN TAB
// ══════════════════════════════════════════════════════════
function FEarn() {
  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div className="bg-gradient-to-br from-[#c4607a] to-[#e8a0b0] rounded-3xl p-7 text-white text-center">
        <div className="text-xs tracking-wider uppercase opacity-85 mb-1.5">Saldo disponible</div>
        <div className="font-serif text-5xl font-semibold leading-none">$218.50</div>
        <div className="text-sm opacity-80 mt-1">Listo para retirar</div>
        <button className="mt-4 bg-white/20 border border-white/30 rounded-full px-6 py-2 text-sm font-semibold cursor-pointer">
          Retirar
        </button>
      </div>

      <div className="bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#9a7a84] mb-4">Resumen del mes</div>
        {[['Chats completados','47'],['Videollamadas','12 hs'],['Propinas recibidas','$38'],['Total del mes','$487.20']].map(([l,v],i) => (
          <div key={l} className={`flex justify-between py-2.5 ${i<3?'border-b border-[rgba(196,96,122,.15)]':''}`}>
            <span className={i===3?'text-[#2a1a20] font-semibold':'text-[#9a7a84]'}>{l}</span>
            <span className={`font-medium ${i>=2?'text-[#c4607a]':'text-[#2a1a20]'}`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-[#9a7a84] text-center">Los retiros se procesan en 24–48 hs hábiles</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PROFILE TAB
// ══════════════════════════════════════════════════════════
function FProfile({ onLogout }) {
  return (
    <div className="px-5 pt-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <div className="w-20 h-20 rounded-full bg-[#f8dde4] text-4xl flex items-center justify-center mx-auto mb-3.5 border-[3px] border-[#c4607a] shadow-[0_0_0_6px_rgba(196,96,122,.2)]">🌺</div>
        <div className="font-serif text-2xl font-semibold">Eva</div>
        <div className="text-sm text-[#9a7a84] mt-1">Activa desde enero 2024</div>
        <div className="inline-flex items-center gap-1.5 bg-[#f8dde4] rounded-full px-4 py-1.5 mt-2.5 text-sm text-[#c4607a] font-medium">⭐ 4.9 · 127 reseñas</div>
      </div>

      <div className="bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl overflow-hidden">
        {['🌸 Sobre mí','📸 Fotos del perfil','🔔 Notificaciones','🔒 Privacidad'].map((item,i,arr) => (
          <div key={item} className={`flex justify-between items-center px-4 py-4 cursor-pointer ${i<arr.length-1?'border-b border-[rgba(196,96,122,.15)]':''}`}>
            <span className="text-[15px]">{item}</span>
            <span className="text-[#9a7a84] text-lg">›</span>
          </div>
        ))}
      </div>

      <button onClick={onLogout} className="w-full py-3.5 bg-transparent border border-[rgba(196,96,122,.15)] rounded-full text-[#2a1a20] text-[15px] cursor-pointer">
        Cerrar sesión
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CREATOR CHAT
// ══════════════════════════════════════════════════════════
function CreatorChat({ user, onBack }) {
  const [messages, setMessages] = useState([
    { who:'them', text:`Hola 😊 ${user.preview}`, time:nowTime() }
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const aiRef = useState(0);

  const send = () => {
    if (!input.trim()) return;
    const t = nowTime();
    setMessages(m => [...m, { who:'me', text:input, time:t }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { who:'them', text:AI_REPLIES[aiRef[0] % AI_REPLIES.length], time:t }]);
      aiRef[0]++;
    }, 1800);
  };

  return (
    <div className="flex flex-col h-screen bg-[#fdf6f0]">
      <div className="flex items-center gap-3 px-4 py-3.5 bg-[#fff9f5] border-b border-[rgba(196,96,122,.15)] shrink-0">
        <button onClick={onBack} className="bg-transparent border-none text-[#2a1a20] text-2xl cursor-pointer leading-none">←</button>
        <div className="w-11 h-11 rounded-full bg-[#f5ece6] text-2xl flex items-center justify-center">{user.emoji}</div>
        <div className="flex-1">
          <div className="font-medium text-base">{user.name}</div>
          <div className="text-xs text-green-500">● En línea</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.map((m,i) => (
          <div key={i} className={`max-w-[76%] ${m.who==='me'?'self-end':'self-start'}`}>
            <div className={`py-3 px-4 rounded-[20px] text-sm leading-relaxed ${m.who==='me'?'bg-gradient-to-br from-[#c4607a] to-[#e8a0b0] text-white rounded-br-[4px]':'bg-[#f5ece6] text-[#2a1a20] rounded-bl-[4px]'}`}>
              {m.text}
            </div>
            <div className={`text-[11px] text-[#9a7a84] mt-1 px-1 ${m.who==='me'?'text-right':'text-left'}`}>{m.time}</div>
          </div>
        ))}
        {typing && (
          <div className="self-start bg-[#f5ece6] rounded-[20px] rounded-bl-[4px] py-3.5 px-4 flex gap-1 items-center">
            {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-[#9a7a84] inline-block" />)}
          </div>
        )}
      </div>

      <div className="px-3.5 py-2.5 pb-5 bg-[#fff9f5] border-t border-[rgba(196,96,122,.15)] flex gap-2.5 items-center shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && send()}
          placeholder="Escribí algo..."
          className="flex-1 bg-[#f5ece6] border border-[rgba(196,96,122,.15)] rounded-full py-3 px-4 text-[#2a1a20] text-sm outline-none"
        />
        <button onClick={send} className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c4607a] to-[#e8a0b0] border-none text-white text-lg cursor-pointer flex items-center justify-center">
          ➤
        </button>
      </div>
    </div>
  );
}