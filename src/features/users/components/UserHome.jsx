import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import ChatScreen from '../../chat/components/ChatScreen';
import PaywallGate from '../../wallet/components/PaywallGate';
import HomeTab from './HomeTab';
import ProfileTab from './ProfileTab';

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
        {tab === 'profile' && <ProfileTab onLogout={handleLogout} />}
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
