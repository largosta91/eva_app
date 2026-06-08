// 📁 src/features/users/components/UserHome.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import ChatScreen from '../../chat/components/ChatScreen';
import PaywallGate from '../../wallet/components/PaywallGate';
import HomeTab from './HomeTab';
import ProfileTab from './ProfileTab';
import { supabase } from '../../../services/api/supabase';
import { StoryRing, StoryModal } from '../../creators/components/CreatorVideoStory';

function ChatsTab({ onSelectGirl }) {
  const { user } = useAppStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyUrl, setStoryUrl] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, content, created_at, is_read')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) return console.error(error);

      const chatsMap = {};
      data.forEach(m => {
        const contactId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!chatsMap[contactId]) {
          chatsMap[contactId] = {
            id: contactId,
            preview: m.content,
            unread: !m.is_read && m.receiver_id === user.id,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            video_url: null,
          };
        }
      });

      const contactIds = Object.keys(chatsMap);
      if (contactIds.length > 0) {
        const { data: profiles } = await supabase
          .from('users')
          .select('id, display_name, avatar_url, video_url')
          .in('id', contactIds);

        profiles?.forEach(p => {
          chatsMap[p.id].name = p.display_name;
          chatsMap[p.id].img = p.avatar_url;
          chatsMap[p.id].video_url = p.video_url;
        });
      }

      setConversations(Object.values(chatsMap));
      setLoading(false);
    };

    fetchConversations();

    const channel = supabase
      .channel('user_chats_list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading) return <div className="p-10 text-center text-[#7a748f]">Cargando conversaciones...</div>;

  return (
    <div className="flex flex-col">
      <StoryModal videoUrl={storyUrl} isOpen={!!storyUrl} onClose={() => setStoryUrl(null)} />
      <div className="px-5 py-2">
        {conversations.length === 0 ? (
          <div className="py-20 text-center text-[#7a748f]">
            <span className="text-4xl block mb-2">🍃</span>
            Aún no tienes chats abiertos
          </div>
        ) : (
          conversations.map(u => (
            <div
              key={u.id}
              onClick={() => onSelectGirl(u)}
              className="flex items-center gap-3.5 py-3.5 border-b border-[rgba(201,168,76,.08)] cursor-pointer active:bg-[rgba(201,168,76,.04)]"
            >
              <StoryRing
                hasVideo={!!u.video_url}
                size={48}
                onClick={(e) => {
                  if (u.video_url) {
                    e.stopPropagation();
                    setStoryUrl(u.video_url);
                  }
                }}
              >
                <div className="w-full h-full rounded-full bg-[#1a1826] overflow-hidden">
                  {u.img
                    ? <img src={u.img} alt={u.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">👩</div>
                  }
                </div>
              </StoryRing>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-[15px] text-[#ede8ff]">{u.name}</span>
                  <span className="text-[11px] text-[#7a748f]">{u.time}</span>
                </div>
                <div className={`text-sm truncate ${u.unread ? 'text-[#ede8ff] font-medium' : 'text-[#7a748f]'}`}>
                  {u.preview}
                </div>
              </div>
              {u.unread && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#c9a84c] shrink-0 shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
              )}
            </div>
          ))
        )}
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
          <div
            onClick={() => setTab('credits')}
            className="flex items-center gap-1.5 bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-full py-2 px-4 text-sm font-medium text-[#c9a84c] cursor-pointer active:scale-95 transition-transform"
          >
            💎 {credits}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'home'    && <HomeTab onSelectGirl={setSelectedGirl} />}
        {tab === 'chats'   && <ChatsTab onSelectGirl={setSelectedGirl} />}
        {tab === 'credits' && <PaywallGate />}
        {tab === 'profile' && <ProfileTab onLogout={handleLogout} />}
      </div>

      <div className="flex bg-[#111018] border-t border-[rgba(201,168,76,.14)] pt-2.5 pb-6 shrink-0">
        {[
          { key: 'home',    icon: '🔥', label: 'Explorar' },
          { key: 'chats',   icon: '💬', label: 'Chats'    },
          { key: 'credits', icon: '/blackAppel.png', label: 'Eva Gold' },
          { key: 'profile', icon: '👤', label: 'Perfil'   },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => t.key === 'credits' ? navigate(ROUTES.PAYWALL) : setTab(t.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer transition-all duration-200 ${
              tab === t.key ? 'text-[#c9a84c]' : 'text-[#7a748f]'
            }`}
          >
            <div className="h-10 flex items-center justify-center">
              {t.key === 'credits' ? (
                <img
                  src={t.icon}
                  alt="Eva Gold"
                  className={`w-9 h-9 object-contain transition-transform duration-200 ${
                    tab === t.key ? 'scale-110 opacity-100' : 'opacity-60'
                  }`}
                />
              ) : (
                <span className={`text-3xl leading-none transition-transform ${tab === t.key ? 'scale-110' : ''}`}>{t.icon}</span>
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