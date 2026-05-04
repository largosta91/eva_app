import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';
import CreatorChatScreen from './CreatorChatScreen';
import IDUpload from '../../verification/components/IDUpload';
import VerificationStatus from '../../verification/components/VerificationStatus';

const DAILY_PHRASES = [
  { text: "Tu presencia es el regalo más valioso que podés dar.", author: "— Eva" },
  { text: "Cada conversación que tenés cambia el día de alguien.", author: "— Eva" },
  { text: "La conexión genuina es un arte, y vos lo dominás.", author: "— Eva" },
  { text: "Sos exactamente lo que alguien necesita hoy.", author: "— Eva" },
  { text: "Tu energía atrae lo que merecés. Hoy es un buen día.", author: "— Eva" },
  { text: "La autenticidad es tu superpoder. Nunca lo subestimes.", author: "— Eva" },
  { text: "Cada 'hola' tuyo puede ser el mejor momento del día de alguien.", author: "— Eva" },
];

// ─── DailyCard ───────────────────────────────────────────────────────────────
function DailyCard() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const phrase = DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
  return (
    <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', background: 'linear-gradient(145deg, #1a0a0f 0%, #2d0f1e 40%, #1a0a0f 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-15%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,96,122,0.35) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,160,176,0.2) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,96,122,0.5), transparent)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '24px 22px 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(196,96,122,0.18)', border: '1px solid rgba(196,96,122,0.3)', borderRadius: 99, padding: '3px 10px', marginBottom: 16 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e8a0b0', fontWeight: 600 }}>✦ Frase del día</span>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.55, color: '#f5e8ed', fontStyle: 'italic', marginBottom: 8, fontWeight: 400 }}>"{phrase.text}"</p>
        <p style={{ fontSize: 11, color: 'rgba(232,160,176,0.6)', marginBottom: 24, letterSpacing: '0.04em' }}>{phrase.author}</p>
        <div style={{ height: 1, background: 'rgba(196,96,122,0.2)' }} />
      </div>
    </div>
  );
}

// ─── Hook conversaciones ─────────────────────────────────────────────────────
function useConversations(creatorId) {
  const [conversations, setConversations] = useState([]);
  const load = useCallback(async () => {
    if (!creatorId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at')
      .or(`sender_id.eq.${creatorId},receiver_id.eq.${creatorId}`)
      .order('created_at', { ascending: false });
    if (!data || error) return;
    const seen = new Map();
    for (const m of data) {
      const otherId = m.sender_id === creatorId ? m.receiver_id : m.sender_id;
      if (otherId === creatorId) continue;
      if (!seen.has(otherId)) seen.set(otherId, m);
    }
    const ids = [...seen.keys()];
    if (ids.length === 0) { setConversations([]); return; }
    const { data: users } = await supabase.from('users').select('id, display_name, avatar_url').in('id', ids);
    const userMap = Object.fromEntries((users || []).map(u => [u.id, { name: u.display_name, avatar: u.avatar_url }]));
    setConversations(ids.map(id => ({ id, name: userMap[id]?.name ?? 'Usuario', avatar: userMap[id]?.avatar || null, preview: seen.get(id).content })));
  }, [creatorId]);
  useEffect(() => { load(); const interval = setInterval(load, 5000); return () => clearInterval(interval); }, [load]);
  return conversations;
}

// ─── AvatarUpload ────────────────────────────────────────────────────────────
function AvatarUpload({ size = 'sm' }) {
  const fileRef = useRef(null);
  const { user, setUser } = useAppStore();
  const isLarge = size === 'lg';
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !user?.id) return;
    setUploading(true);
    try {
      const ext = f.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, f, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
      setUser({ ...user, avatar_url: publicUrl });
    } catch (err) { console.error('Upload error:', err); }
    finally { setUploading(false); }
  };
  const avatar = user?.avatar_url || null;
  return (
    <div className="relative" style={{ width: isLarge ? 80 : 44, height: isLarge ? 80 : 44 }}>
      <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: avatar ? 'transparent' : '#f8dde4', border: isLarge ? '3px solid #c4607a' : 'none', boxShadow: isLarge ? '0 0 0 6px rgba(196,96,122,.2)' : 'none', fontSize: isLarge ? 36 : 22 }}>
        {uploading ? <span className="text-lg animate-pulse">⏳</span> : avatar ? <img src={avatar} alt="perfil" className="w-full h-full object-cover rounded-full" /> : '🌺'}
      </div>
      <button onClick={() => fileRef.current?.click()}
        className="absolute flex items-center justify-center rounded-full border-none cursor-pointer active:scale-90 transition-transform"
        style={{ bottom: 0, right: 0, width: isLarge ? 26 : 18, height: isLarge ? 26 : 18, fontSize: isLarge ? 13 : 9, background: 'linear-gradient(135deg,#f472b6,#7c3aed)', border: '2px solid #fdf6f0' }}>
        📷
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── CoverUpload ────────────────────────────────────────────────────────────
function CoverUpload() {
  const fileRef = useRef(null);
  const { user, setUser } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !user?.id) return;
    setUploading(true);
    try {
      const ext = f.name.split('.').pop();
      const path = `${user.id}/cover.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, f, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('users').update({ cover_url: publicUrl }).eq('id', user.id);
      setUser({ ...user, cover_url: publicUrl });
    } catch (err) { console.error('Cover upload error:', err); }
    finally { setUploading(false); }
  };
  const cover = user?.cover_url || null;
  return (
    <div onClick={() => fileRef.current?.click()}
      className="w-full rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-[rgba(196,96,122,.3)] flex items-center justify-center"
      style={{ height: 120, background: cover ? 'transparent' : 'rgba(196,96,122,.05)', position: 'relative' }}>
      {uploading ? <span className="text-2xl animate-pulse">⏳</span>
        : cover ? (<><img src={cover} alt="cover" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="text-white text-sm font-medium">📷 Cambiar foto</span></div></>)
        : (<div className="flex flex-col items-center gap-1 text-[#9a7a84]"><span className="text-2xl">📷</span><span className="text-xs">Subir segunda foto</span></div>)
      }
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Pantalla de verificación bloqueante ─────────────────────────────────────
function VerificationGate({ status, onUploaded }) {
  return (
    <div className="w-full h-screen bg-[#fdf6f0] flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center mb-2">
        <span className="text-5xl">🔐</span>
        <h1 className="font-serif text-2xl font-semibold text-[#c4607a] mt-3">Verificá tu identidad</h1>
        <p className="text-sm text-[#9a7a84] mt-1">Para empezar a usar Eva necesitamos confirmar que sos vos.</p>
      </div>
      {status === 'none' && <IDUpload theme="light" onDone={onUploaded} />}
      {(status === 'pending' || status === 'rejected') && (
        <VerificationStatus theme="light" onRetry={onUploaded} />
      )}
    </div>
  );
}

// ─── CreatorHome ─────────────────────────────────────────────────────────────
export default function CreatorHome() {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [tab, setTab] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [verifStatus, setVerifStatus] = useState(user?.verification_status ?? 'none');

  // Bloquear si no está aprobada
  const isBlocked = verifStatus !== 'approved';

  if (selectedUser) return <CreatorChatScreen user={selectedUser} onBack={() => setSelectedUser(null)} />;

  if (isBlocked) return (
    <VerificationGate
      status={verifStatus}
      onUploaded={() => setVerifStatus('pending')}
    />
  );

  return (
    <div className="w-full h-screen bg-[#fdf6f0] text-[#2a1a20] flex flex-col overflow-hidden">
      <div className="grid grid-cols-3 items-center py-3.5 px-5 bg-[#fff9f5] border-b border-[rgba(196,96,122,.15)] shrink-0">
        <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#c4607a] to-[#e8a0b0] shadow-sm">
          <div className="w-full h-full rounded-full p-[1.5px] bg-[#fff9f5] overflow-hidden">
            <div className="w-full h-full rounded-full" style={{ backgroundImage: 'url(/logo.png)', backgroundSize: 'cover', backgroundPosition: 'center 25%' }} />
          </div>
        </div>
        <div className="flex justify-center">
          <span className="font-serif text-2xl font-semibold bg-gradient-to-r from-[#c4607a] to-[#e8a0b0] bg-clip-text text-transparent">Eva</span>
        </div>
        <div className="flex justify-end"><div className="w-9 h-9" /></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'home'    && <FHome onSelectUser={setSelectedUser} />}
        {tab === 'chats'   && <FChats onSelectUser={setSelectedUser} />}
        {tab === 'earn'    && <FEarn />}
        {tab === 'profile' && <FProfile onLogout={() => { logout(); navigate(ROUTES.SPLASH); }} />}
      </div>

      <div className="flex bg-[#fff9f5] border-t border-[rgba(196,96,122,.15)] pt-2.5 pb-5 shrink-0">
        {[['home','🏠','Inicio'],['chats','💬','Chats'],['earn','💰','Ganancias'],['profile','📷','Perfil']].map(([key,icon,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors ${tab === key ? 'text-[#c4607a]' : 'text-[#9a7a84]'}`}>
            <span className="text-2xl">{icon}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FHome ───────────────────────────────────────────────────────────────────
function FHome({ onSelectUser }) {
  const { user } = useAppStore();
  const conversations = useConversations(user?.id);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  const loadStats = useCallback(async () => {
    if (!user) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    try {
      const { data: gifts, error } = await supabase.from('gifts').select('value').eq('creator_id', user.id).gte('created_at', today.toISOString());
      if (!error && gifts) setDailyEarnings(gifts.reduce((acc, g) => acc + (parseFloat(g.value) || 0), 0).toFixed(2));
    } catch (err) { console.error('Error en loadStats:', err); }
    setChatCount(conversations.length);
  }, [user, conversations.length]);

  useEffect(() => { loadStats(); const interval = setInterval(loadStats, 30000); return () => clearInterval(interval); }, [loadStats]);

  return (
    <div className="flex flex-col pb-4 h-full bg-[#fdf6f0]">
      <div className="bg-[#fff9f5] border-b border-[rgba(196,96,122,.15)]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="font-serif text-2xl font-semibold text-[#2a1a20]">Hola 🎀</div>
            <div className="text-sm text-[#9a7a84] mt-0.5">Bienvenida de nuevo</div>
          </div>
          <AvatarUpload size="sm" />
        </div>
        <div className="flex gap-3 px-4 py-3">
          {[{ label: 'Hoy', value: `$${dailyEarnings}` }, { label: 'Chats', value: chatCount }, { label: 'Rating', value: '4.9' }].map((item) => (
            <div key={item.label} className="flex-1 bg-white/50 backdrop-blur-sm border border-[rgba(196,96,122,.1)] p-3 rounded-2xl text-center shadow-sm">
              <div className="text-[10px] text-[#9a7a84] uppercase font-bold mb-1 tracking-wider">{item.label}</div>
              <div className="font-serif text-xl font-bold text-[#c4607a]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 flex flex-col gap-3">
        <DailyCard />
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#9a7a84] mb-1 mt-3">Solicitudes nuevas</div>
        {conversations.length === 0
          ? <div className="text-center text-[#9a7a84] py-10 bg-white/30 rounded-3xl border border-dashed border-pink-200 text-sm italic">No hay mensajes aún</div>
          : conversations.map(u => (
            <div key={u.id} onClick={() => onSelectUser(u)}
              className="flex items-center gap-3.5 bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform">
              <div className="w-12 h-12 rounded-full bg-[#f5ece6] text-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : '🎩'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] mb-0.5 text-[#2a1a20]">{u.name}</div>
                <div className="text-xs text-[#9a7a84] truncate">{u.preview}</div>
              </div>
              <div className="text-[#c4607a] text-lg">›</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── FChats ──────────────────────────────────────────────────────────────────
function FChats({ onSelectUser }) {
  const { user } = useAppStore();
  const conversations = useConversations(user?.id);
  return (
    <div className="px-5 py-2">
      {conversations.length === 0
        ? <div className="text-center text-[#9a7a84] py-10 text-sm">No hay chats aún</div>
        : conversations.map(u => (
          <div key={u.id} onClick={() => onSelectUser(u)} className="flex items-center gap-3.5 py-3.5 border-b border-[rgba(196,96,122,.15)] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#f5ece6] text-2xl flex items-center justify-center shrink-0 overflow-hidden">
              {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : '🎩'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[15px] mb-1">{u.name}</div>
              <div className="text-sm text-[#9a7a84] truncate">{u.preview}</div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── FEarn ───────────────────────────────────────────────────────────────────
function FEarn() {
  const stats = { balance: 218.50, chats: 47, callsHours: 12, tips: 38, total: 487.20 };
  const rows = [['Chats completados', stats.chats], ['Videollamadas', `${stats.callsHours} hs`], ['Propinas recibidas', `$${stats.tips}`], ['Total del mes', `$${stats.total}`]];
  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div className="bg-gradient-to-br from-[#c4607a] to-[#e8a0b0] rounded-3xl p-7 text-white text-center">
        <div className="text-xs tracking-wider uppercase opacity-85 mb-1.5">Saldo disponible</div>
        <div className="font-serif text-5xl font-semibold leading-none">${stats.balance}</div>
        <div className="text-sm opacity-80 mt-1">Listo para retirar</div>
        <button className="mt-4 bg-white/20 border border-white/30 rounded-full px-6 py-2 text-sm font-semibold cursor-pointer">Retirar</button>
      </div>
      <div className="bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#9a7a84] mb-4">Resumen del mes</div>
        {rows.map(([l, v], i) => (
          <div key={l} className={`flex justify-between py-2.5 ${i < 3 ? 'border-b border-[rgba(196,96,122,.15)]' : ''}`}>
            <span className={i === 3 ? 'text-[#2a1a20] font-semibold' : 'text-[#9a7a84]'}>{l}</span>
            <span className={`font-medium ${i >= 2 ? 'text-[#c4607a]' : 'text-[#2a1a20]'}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FProfile ────────────────────────────────────────────────────────────────
function FProfile({ onLogout }) {
  const { user, setUser } = useAppStore();
  const [view, setView] = useState('menu');
  const [bio, setBio] = useState("Amo el café y las charlas profundas 🌸");
  const [name, setName] = useState(user?.display_name || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { if (user?.display_name) setName(user.display_name); }, [user?.display_name]);

  const saveName = async () => {
    setIsEditing(false);
    if (!name.trim() || name === user?.display_name) return;
    try {
      const { error } = await supabase.from('users').update({ display_name: name.trim() }).eq('id', user.id);
      if (error) throw error;
      setUser({ ...user, display_name: name.trim() });
    } catch (err) { console.error('Error guardando nombre:', err.message); }
  };

  if (view === 'about') return (
    <div className="p-5 flex flex-col h-full bg-[#fdf6f0]">
      <button onClick={() => setView('menu')} className="self-start mb-4 text-[#c4607a]">← Volver</button>
      <h2 className="font-serif text-2xl mb-4">Sobre mí</h2>
      <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={150}
        className="w-full h-32 p-4 rounded-2xl bg-white border border-pink-100 outline-none text-sm leading-relaxed"
        placeholder="Escribí algo corto..." />
      <div className="text-right text-[10px] text-[#9a7a84] mt-1">{bio.length}/150</div>
      <button onClick={() => setView('menu')} className="mt-6 bg-[#c4607a] text-white py-3.5 rounded-full font-semibold">Guardar cambios</button>
    </div>
  );

  if (view === 'privacy') return (
    <div className="p-5 flex flex-col bg-[#fdf6f0] overflow-y-auto min-h-full">
      <button onClick={() => setView('menu')} className="self-start mb-4 text-[#c4607a]">← Volver</button>
      <h2 className="font-serif text-2xl mb-4">Seguridad</h2>
      <div className="mb-4">
        <VerificationStatus theme="light" />
      </div>
      <div className="bg-[#fff1f1] p-5 rounded-3xl border border-red-100">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Centro de Ayuda</h3>
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=support.evaapp@gmail.com', '_blank')}
            className="w-full py-3 bg-[#c4607a] text-white rounded-2xl text-sm font-semibold">Email Soporte 📧</button>
          <button onClick={() => window.open('https://wa.me/541168892507', '_blank')}
            className="w-full py-3 bg-[#25D366] text-white rounded-2xl text-sm font-semibold">WhatsApp 💬</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-5 pt-6 flex flex-col gap-4 bg-[#fdf6f0] h-full">
      <div className="text-center mb-2">
        <div className="flex justify-center mb-3.5"><AvatarUpload size="lg" /></div>
        <div className="flex items-center justify-center gap-2 mt-1">
          {isEditing
            ? <input value={name} autoFocus onChange={e => setName(e.target.value)}
                onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()}
                className="font-serif text-2xl font-semibold text-center bg-white text-[#2a1a20] px-3 py-1 rounded-lg outline-none border border-[#c4607a]" />
            : <div className="font-serif text-2xl font-semibold">{user?.display_name || ''}</div>
          }
          <button onClick={() => setIsEditing(true)} className="text-[#9a7a84] hover:text-[#c4607a] bg-transparent border-none cursor-pointer">✏️</button>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#e0f2fe] rounded-full px-4 py-1.5 mt-2.5 text-sm text-[#0369a1] font-medium">
          ✅ Perfil Verificado
        </div>
      </div>

      <div className="bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9a7a84] mb-3">Segunda foto de perfil</p>
        <CoverUpload />
        <p className="text-[10px] text-[#9a7a84] mt-2 text-center">Los usuarios la ven al mantener presionada tu card</p>
      </div>

      <div className="bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl overflow-hidden">
        {[['🌸 Sobre mí','about'],['🔒 Seguridad y Privacidad','privacy']].map(([label,key],i,arr) => (
          <div key={key} onClick={() => setView(key)}
            className={`flex justify-between items-center px-4 py-4 cursor-pointer active:bg-pink-50 ${i < arr.length-1 ? 'border-b border-[rgba(196,96,122,.15)]' : ''}`}>
            <span className="text-[15px]">{label}</span>
            <span className="text-[#9a7a84] text-lg">›</span>
          </div>
        ))}
      </div>

      <button onClick={onLogout} className="w-full py-3.5 bg-transparent border border-[rgba(196,96,122,.15)] rounded-full text-[#2a1a20] text-[15px] cursor-pointer mt-auto mb-10">
        Cerrar sesión
      </button>
    </div>
  );
}