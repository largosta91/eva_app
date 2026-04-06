// 📁 src/features/users/components/UserHome.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import ChatScreen from '../../chat/components/ChatScreen';
import PaywallGate from '../../wallet/components/PaywallGate';
import HomeTab from './HomeTab';
import ProfileTab from './ProfileTab';

const CHAT_HISTORY = [
  { id: 1, name: "Sofía",    emoji: "👩", preview: "Me alegra que hablemos ✨",    time: "ahora", unread: true  },
  { id: 2, name: "Valentina",emoji: "👩", preview: "¿Volvés mañana? 💜",           time: "3m",    unread: true  },
  { id: 3, name: "Camila",   emoji: "👩", preview: "Fue lindo hablar con vos",     time: "1h",    unread: false },
  { id: 4, name: "Isabella", emoji: "👩", preview: "Estoy acá cuando quieras 🌺",  time: "ayer",  unread: false },
];

function ChatsTab({ onSelectGirl }) {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2">
        {CHAT_HISTORY.map(u => (
          <div
            key={u.id}
            onClick={() => onSelectGirl(u)}
            className="flex items-center gap-3.5 py-3.5 border-b border-[rgba(201,168,76,.08)] cursor-pointer active:bg-[rgba(201,168,76,.04)]"
          >
            <div className="w-12 h-12 rounded-full bg-[#1a1826] text-2xl flex items-center justify-center shrink-0 border border-[rgba(201,168,76,.14)]">
              {u.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-[15px] text-[#ede8ff]">{u.name}</span>
                <span className="text-[11px] text-[#7a748f]">{u.time}</span>
              </div>
              <div className={`text-sm truncate ${u.unread ? 'text-[#ede8ff]' : 'text-[#7a748f]'}`}>
                {u.preview}
              </div>
            </div>
            {u.unread && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#c9a84c] shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserHome() {
  const navigate = useNavigate();
  const { credits, spendCredits, logout } = useAppStore();
  const [tab, setTab] = useState('home');
  const [selectedGirl, setSelectedGirl] = useState(null);

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
      <div className="grid grid-cols-3 items-center py-3.5 px-5 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">
        <div className="flex items-center justify-start">
          <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#8b3a9c] to-[#c9a84c]">
            <div className="w-full h-full rounded-full p-[1.5px] bg-[#111018] overflow-hidden">
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundImage: 'url(/logo.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 25%',
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <span className="font-serif text-3xl font-semibold bg-gradient-to-br from-[#8b3a9c] to-[#c9a84c] bg-clip-text text-transparent whitespace-nowrap">
            Eva
          </span>
        </div>

        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-full py-2 px-4 text-sm font-medium text-[#c9a84c] cursor-pointer">
            💎 {credits}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'home'    && <HomeTab onSelectGirl={setSelectedGirl} />}
        {tab === 'chats'   && <ChatsTab onSelectGirl={setSelectedGirl} />}
        {tab === 'credits' && <PaywallGate />}
        {tab === 'profile' && <ProfileTab onLogout={handleLogout} />}
      </div>

      {/* TAB BAR */}
      <div className="flex bg-[#111018] border-t border-[rgba(201,168,76,.14)] pt-2.5 pb-6 shrink-0">
        {[
          { key: 'home',    icon: '🔥', label: 'Explorar' },
          { key: 'chats',   icon: '💬', label: 'Chats'    },
          { key: 'credits', icon: '/blackAppel.png', label: 'Eva Gold' },
          { key: 'profile', icon: '👤', label: 'Perfil'   },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer transition-all duration-200 ${
              tab === t.key ? 'text-[#c9a84c]' : 'text-[#7a748f]'
            }`}
          >
            {/* Subimos la altura a h-10 para que la manzana pueda ser más grande */}
            <div className="h-10 flex items-center justify-center">
              {t.key === 'credits' ? (
                <img 
                  src={t.icon} 
                  alt="Eva Gold" 
                  /* Agrandamos a w-9 h-9 (36px) */
                  className={`w-9 h-9 object-contain transition-transform duration-200 ${
                    tab === t.key ? 'scale-110 opacity-100' : 'opacity-60'
                  }`} 
                />
              ) : (
                /* Subimos un pelín el texto a 3xl para que no se vea chico al lado de la manzana */
                <span className="text-3xl leading-none">{t.icon}</span>
              )}
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}