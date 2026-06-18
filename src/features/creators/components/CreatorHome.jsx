import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';
import CreatorChatScreen from './CreatorChatScreen';
import CreatorVideoCall from './CreatorVideoCall';
import IDUpload from '../../verification/components/IDUpload';
import VerificationStatus from '../../verification/components/VerificationStatus';
import CreatorCard from '../../users/components/CreatorCard';

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
  const phrase = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    return DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
  }, []);

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

// ─── IncomingCallAlertVisual ──────────────────────────────────────────────────
function IncomingCallAlertVisual() {
  const [hasRequest, setHasRequest] = useState(true);
  if (!hasRequest) return null;
  return (
    <div style={{ background: 'linear-gradient(135deg, #2d0f1e 0%, #1a0a0f 100%)', border: '2px solid #c4607a', borderRadius: 20, padding: '16px 20px', marginBottom: 20, boxShadow: '0 0 20px rgba(196,96,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'pulse 2s infinite' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 24, animation: 'bounce 1s infinite' }}>📞</div>
        <div>
          <h4 style={{ margin: 0, color: '#f5e8ed', fontSize: 15 }}>¡Solicitud de llamada directa!</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'rgba(232,160,176,0.8)' }}>
            <strong style={{ color: '#e8a0b0' }}>@FanAnonimo</strong> quiere llamarte • <span style={{ color: '#22c55e', fontWeight: 600 }}>10 min ($50.00)</span>
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setHasRequest(false)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: 12, fontSize: 12, cursor: 'pointer' }}>Rechazar</button>
        <button onClick={() => alert("Simulación: Iniciando sala de video segura...")} style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Atender</button>
      </div>
    </div>
  );
}

// ─── Hook conversaciones ──────────────────────────────────────────────────────
function useConversations(creatorId) {
  const [conversations, setConversations] = useState([]);

  const load = useCallback(async () => {
    if (!creatorId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at, is_read')
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

    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, video_url')
      .in('id', ids);

    const userMap = Object.fromEntries((users || []).map(u => [u.id, {
      name: u.display_name,
      avatar: u.avatar_url,
      video_url: u.video_url || null,
    }]));
//console log para debug: muestra cada conversación con su estado de leído/no leído
console.log('unread check:', ids.map(id => ({
  id,
  unread: data.some(m => m.receiver_id === creatorId && m.sender_id === id && m.is_read === false)
})));


    setConversations(
      ids.map(id => ({
        id,
        name: userMap[id]?.name ?? 'Usuario',
        avatar: userMap[id]?.avatar || null,
        video_url: userMap[id]?.video_url || null,
        preview: seen.get(id).content,
        unread: data.some(m =>
          m.receiver_id === creatorId &&
          m.sender_id === id &&
          m.is_read === false
        ),
      }))
    );
  }, [creatorId]);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return conversations;
}

// ─── StoryAvatar: avatar con anillo reutilizable ──────────────────────────────
function StoryAvatar({ u, size = 48, onStoryClick }) {
  return (
    <div
      style={{ width: size, height: size, borderRadius: '50%', padding: u.video_url ? 2 : 0, background: u.video_url ? 'linear-gradient(135deg, #c4607a, #833AB4, #FCAF45)' : 'transparent', animation: u.video_url ? 'storyRingSpin 3s linear infinite' : 'none', backgroundSize: '200% 200%', flexShrink: 0, cursor: u.video_url ? 'pointer' : 'default' }}
      onClick={(e) => { if (u.video_url && onStoryClick) { e.stopPropagation(); onStoryClick(u.video_url); } }}
    >
      <div className="w-full h-full rounded-full bg-[#f5ece6] overflow-hidden flex items-center justify-center text-2xl" style={{ border: u.video_url ? '2px solid #fdf6f0' : 'none' }}>
        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : '🎩'}
      </div>
    </div>
  );
}

// ─── StoryModal ───────────────────────────────────────────────────────────────
function StoryModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video src={url} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 16 }} onEnded={onClose} onClick={e => e.stopPropagation()} />
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>✕</button>
    </div>
  );
}

// ─── AvatarUpload ─────────────────────────────────────────────────────────────
function AvatarUpload({ size = 'sm' }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const { user, setUser } = useAppStore();
  const isLarge = size === 'lg';
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showVideo, setShowVideo] = useState(false);


  useEffect(() => {
    const loadFreshStory = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.from('users').select('video_url, video_created_at').eq('id', user.id).single();
      if (error || !data) return;
      setUser(prev => ({ ...prev, video_url: data.video_url || null, video_created_at: data.video_created_at || null }));
    };
    loadFreshStory();
  }, [user?.id, setUser]);

  const isExpired = user?.video_created_at && Date.now() - new Date(user.video_created_at).getTime() > 24 * 60 * 60 * 1000;
  const avatar = user?.avatar_url || null;
  const hasVideo = !!user?.video_url && !isExpired;

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
      setUser(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) { console.error('Upload error:', err); }
    finally { setUploading(false); }
  };

  const handleVideo = async (e) => {
    console.log('USER EN HANDLERVIDEO:', user);
    const f = e.target.files?.[0];
    if (!f || !user?.id) { console.log('FRENADO: no hay archivo o no hay user.id'); return; }
    setUploadingVideo(true);
    try {
      const ext = f.name.split('.').pop();
      const path = `${user.id}/presentation.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, f, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      const now = new Date().toISOString();
      await supabase.from('users').update({ video_url: publicUrl, video_created_at: now }).eq('id', user.id);
      setUser(prev => ({ ...prev, video_url: publicUrl, video_created_at: now }));
    } catch (err) { console.error('Video upload error:', err); }
    finally { setUploadingVideo(false); }
  };

  const handleDeleteStory = async () => {
    if (!user?.id) return;
    try {
      // Intenta borrar las extensiones más comunes
      await supabase.storage.from('avatars').remove([
        `${user.id}/presentation.mp4`,
        `${user.id}/presentation.webm`,
        `${user.id}/presentation.mov`,
        `${user.id}/presentation.avi`,
      ]);
      await supabase.from('users').update({ video_url: null, video_created_at: null }).eq('id', user.id);
      setUser(prev => ({ ...prev, video_url: null, video_created_at: null }));
    } catch (err) { console.error('Delete story error:', err); }
  };

  return (
    <>
      {showVideo && hasVideo && (
        <div onClick={() => setShowVideo(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video src={user.video_url} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 16 }} onEnded={() => setShowVideo(false)} onClick={e => e.stopPropagation()} />
          <button onClick={() => setShowVideo(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="relative" style={{ width: isLarge ? 80 : 44, height: isLarge ? 80 : 44 }}>
        <div onClick={() => hasVideo && setShowVideo(true)} style={{ width: '100%', height: '100%', borderRadius: '50%', padding: hasVideo ? 2 : 0, background: hasVideo ? 'linear-gradient(135deg, #c4607a, #833AB4, #FCAF45)' : 'transparent', ...(hasVideo && { backgroundSize: '200% 200%' }), animation: hasVideo ? 'storyRingSpin 3s linear infinite' : 'none', cursor: hasVideo ? 'pointer' : 'default' }}>
          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ background: avatar ? 'transparent' : '#f8dde4', border: hasVideo ? '2px solid #fff9f5' : isLarge ? '3px solid #c4607a' : 'none', boxShadow: isLarge && !hasVideo ? '0 0 0 6px rgba(196,96,122,.2)' : 'none', fontSize: isLarge ? 36 : 22 }}>
            {uploading ? <span className="text-lg animate-pulse">⏳</span> : avatar ? <img src={avatar} alt="perfil" className="w-full h-full object-cover rounded-full" /> : '🌺'}
          </div>
        </div>

        {/* Botón eliminar EvaStory — solo en lg y cuando hay historia activa */}
        {isLarge && hasVideo && (
          <button
            onClick={handleDeleteStory}
            title="Eliminar EvaStory"
            className="absolute flex items-center justify-center rounded-full border-none cursor-pointer active:scale-90 transition-transform"
            style={{ top: 0, right: 0, width: 20, height: 20, fontSize: 10, background: 'rgba(139,58,156,0.5)', border: '2px solid #fdf6f0', zIndex: 4, color: 'white', fontWeight: 'bold', lineHeight: 1 }}
          >
            ✕
          </button>
        )}

        <button onClick={() => fileRef.current?.click()} className="group absolute flex items-center justify-center rounded-full border-none cursor-pointer active:scale-90 transition-transform" style={{ bottom: 0, right: 0, width: isLarge ? 26 : 18, height: isLarge ? 26 : 18, fontSize: isLarge ? 13 : 9, background: 'linear-gradient(135deg,#f472b6,#7c3aed)', border: '2px solid #fdf6f0', zIndex: 3 }}>
          📷
          <span className="absolute bottom-[135%] right-0 pointer-events-none scale-0 group-hover:scale-100 transition-all duration-150 bg-black text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 origin-bottom-right">
            {uploading ? 'Subiendo...' : 'Foto de perfil'}
          </span>
        </button>

        {isLarge && (
          <button onClick={() => videoRef.current?.click()} className="group absolute flex items-center justify-center rounded-full border-none cursor-pointer active:scale-90 transition-transform" style={{ bottom: 0, left: 0, width: 26, height: 26, fontSize: 13, background: uploadingVideo ? 'rgba(139,58,156,0.5)' : 'linear-gradient(135deg,#f472b6,#7c3aed)', border: '2px solid #fdf6f0', zIndex: 3 }}>
            {uploadingVideo ? '⏳' : '🎥'}
            <span className="absolute bottom-[135%] left-0 pointer-events-none scale-0 group-hover:scale-100 transition-all duration-150 bg-black text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 origin-bottom-left">
              {uploadingVideo ? 'Subiendo...' : 'EvaStory'}
            </span>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />
      </div>

      <style>{`
        @keyframes storyRingSpin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
// ─── CoverUpload ──────────────────────────────────────────────────────────────
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
    <div onClick={() => fileRef.current?.click()} className="w-full rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-[rgba(196,96,122,.3)] flex items-center justify-center" style={{ height: 120, background: cover ? 'transparent' : 'rgba(196,96,122,.05)', position: 'relative' }}>
      {uploading ? <span className="text-2xl animate-pulse">⏳</span>
        : cover ? (
          <>
            <img src={cover} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-sm font-medium">📷 Cambiar foto</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[#9a7a84]">
            <span className="text-2xl">📷</span>
            <span className="text-xs">Subir segunda foto</span>
          </div>
        )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── VerificationGate ─────────────────────────────────────────────────────────
function VerificationGate({ status, onUploaded }) {
  return (
    <div className="w-full h-screen bg-[#fdf6f0] flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center mb-2">
        <span className="text-5xl">🔐</span>
        <h1 className="font-serif text-2xl font-semibold text-[#c4607a] mt-3">Verificá tu identidad</h1>
        <p className="text-sm text-[#9a7a84] mt-1">Para empezar a usar Eva necesitamos confirmar que sos vos.</p>
      </div>
      {status === 'none' && <IDUpload theme="light" onDone={onUploaded} />}
      {(status === 'pending' || status === 'rejected') && <VerificationStatus theme="light" onRetry={onUploaded} />}
    </div>
  );
}

function VerificationLoading() {
  return (
    <div className="w-full h-screen bg-[#fdf6f0] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔐</div>
        <div className="font-serif text-xl text-[#c4607a]">Cargando verificación...</div>
      </div>
    </div>
  );
}

// ─── CreatorHome ──────────────────────────────────────────────────────────────
  export default function CreatorHome() {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [tab, setTab] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [verifStatus, setVerifStatus] = useState(user?.verification_status ?? 'none');
  const [verifLoading, setVerifLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
   const [incomingCall, setIncomingCall] = useState(null);
  const [callToken, setCallToken] = useState(null);
  const [showVC, setShowVC] = useState(false);
  const scrollRef = useRef(null);

  const syncVerificationStatus = useCallback(async () => {
    if (!user?.id) { setVerifStatus('none'); setVerifLoading(false); return; }
    setVerifLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('verification_status').eq('id', user.id).single();
      if (error) throw error;
      setVerifStatus(data?.verification_status ?? 'none');
    } catch (err) {
      console.error('Error leyendo verification_status:', err);
      setVerifStatus(user?.verification_status ?? 'none');
    } finally { setVerifLoading(false); }
  }, [user?.id, user?.verification_status]);

  useEffect(() => {
    setVerifStatus(user?.verification_status ?? 'none');
    syncVerificationStatus();
  }, [user?.id, user?.verification_status, syncVerificationStatus]);

  const handleUploaded = useCallback(async () => { await syncVerificationStatus(); }, [syncVerificationStatus]);
  const isBlocked = verifStatus !== 'approved';

  // ── Listener global llamadas entrantes ──
  useEffect(() => {
    if (!user?.id) return;
    const callChannel = supabase
      .channel(`calls_global_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_requests',
        filter: `creator_id=eq.${user.id}`,
      }, (payload) => {
        const req = payload.new;
        if (req.status !== 'pending') return;
        setIncomingCall({ callerId: req.caller_id, roomName: req.room_name, requestId: req.id });
      })
      .subscribe();
    return () => supabase.removeChannel(callChannel);
  }, [user?.id]);

  const acceptCall = async () => {
    if (!incomingCall) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/livekit-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({
          roomName: incomingCall.roomName,
          participantName: user?.display_name || 'Creadora',
          participantIdentity: user?.id,
        }),
      }
    );
    const { token } = await res.json();
    await supabase.from('call_requests').update({ status: 'accepted' }).eq('id', incomingCall.requestId);
    setCallToken(token);
    setShowVC(true);
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    await supabase.from('call_requests').update({ status: 'rejected' }).eq('id', incomingCall.requestId);
    setIncomingCall(null);
  };

  if (verifLoading) return <VerificationLoading />;
  if (isBlocked) return <VerificationGate status={verifStatus} onUploaded={handleUploaded} />;
  if (selectedUser) return <CreatorChatScreen user={selectedUser} onBack={() => setSelectedUser(null)} />;
  if (showVC) return (
    <CreatorVideoCall
      user={{ id: incomingCall?.callerId, name: 'Usuario' }}
      token={callToken}
      roomName={incomingCall?.roomName}
      onEnd={() => { setShowVC(false); setCallToken(null); setIncomingCall(null); }}
    />
  );

  return (
    <div className="w-full h-screen bg-[#fdf6f0] text-[#2a1a20] flex flex-col overflow-hidden">

      {/* LLAMADA ENTRANTE GLOBAL */}
      {incomingCall && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0830, #09080f)', border: '1px solid rgba(244,114,182,.3)', borderRadius: 24, padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 280 }}>
            <div style={{ fontSize: 64 }}>📹</div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>Llamada entrante</div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, textAlign: 'center' }}>Alguien te quiere llamar</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <button onClick={rejectCall} style={{ width: 60, height: 60, borderRadius: '50%', background: '#ef4444', border: 'none', fontSize: 24, cursor: 'pointer' }}>❌</button>
              <button onClick={acceptCall} style={{ width: 60, height: 60, borderRadius: '50%', background: '#22c55e', border: 'none', fontSize: 24, cursor: 'pointer' }}>✅</button>
            </div>
          </div>
        </div>
      )}
  <div
    className={`grid grid-cols-3 items-center py-3.5 px-5 shrink-0 transition-all duration-300 ${
      scrolled
        ? 'border-b border-white/10'
        : 'border-b border-[rgba(196,96,122,.15)]'
    }`}
    style={{
      background: scrolled
        ? 'linear-gradient(135deg, #833AB4, #C13584, #E1306C, #F77737, #FCAF45)'
        : 'white',
    }}
  >
    <div
      className={`w-9 h-9 rounded-full p-[1.5px] shadow-sm transition-all duration-300 ${
        scrolled
          ? 'bg-white/20'
          : 'bg-gradient-to-br from-[#c4607a] to-[#e8a0b0]'
      }`}
    >
      <div
        className={`w-full h-full rounded-full p-[1.5px] overflow-hidden transition-all duration-300 ${
          scrolled ? 'bg-black/10' : 'bg-[#fff9f5]'
        }`}
      >
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

    <div className="flex justify-center">
      <span
        className={`font-serif text-2xl font-semibold transition-colors duration-300 ${
          scrolled ? 'text-white/90' : 'text-[#c4607a]'
        }`}
      >
        Eva
      </span>
    </div>

    <div className="flex justify-end">
      <div className="w-9 h-9" />
    </div>
  </div>

  <div
    ref={scrollRef}
    onScroll={() => setScrolled(scrollRef.current?.scrollTop > 60)}
    className="flex-1 overflow-y-auto"
  >
    {tab === 'home'    && <FHome onSelectUser={setSelectedUser} />}
    {tab === 'chats'   && <FChats onSelectUser={setSelectedUser} />}
    {tab === 'earn'    && <FEarn />}
    {tab === 'profile' && <FProfile onLogout={() => { logout(); navigate(ROUTES.SPLASH); }} />}
  </div>

  <div
  className="flex bg-[#0a0a0a] border-t border-[rgba(255,255,255,.08)] pt-2.5 pb-5 shrink-0"
  style={{
    background: 'linear-gradient(to top, #0a0a0a 85%, rgba(10,10,10,0.7) 95%, transparent 100%)'
  }}
>
  {[['home','🏠','Inicio'],['chats','💬','Chats'],['earn','💰','Ganancias'],['profile','📷','Perfil']].map(([key, icon, label]) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`flex-1 flex flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors ${
        tab === key ? 'text-white' : 'text-white/50'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  ))}
</div>

    </div>
  );
}

function FHome({ onSelectUser }) {
  const { user } = useAppStore();
  const conversations = useConversations(user?.id);

  const [pendingBalance, setPendingBalance] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [storyUrl, setStoryUrl] = useState(null);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('creator_balances')
        .select('pending_balance')
        .eq('creator_id', user.id)
        .single();
      if (!error) setPendingBalance(data?.pending_balance ?? 0);
    } catch (err) {
      console.error('Error en loadStats:', err);
    }
    setChatCount(conversations.length);
  }, [user, conversations.length]);

  useEffect(() => {
    loadStats(); // eslint-disable-line react-hooks/set-state-in-effect
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  return (
    <div className="flex flex-col pb-4 h-full bg-[#fdf6f0]">
      <StoryModal url={storyUrl} onClose={() => setStoryUrl(null)} />

      <div className="bg-[#fff9f5] border-b border-[rgba(196,96,122,.15)]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="font-serif text-2xl font-semibold text-[#2a1a20]">
              Hola 🎀
            </div>
            <div className="text-sm text-[#9a7a84] mt-0.5">
              Bienvenida de nuevo
            </div>
          </div>
          <AvatarUpload size="sm" />
        </div>

        <div className="flex gap-3 px-4 py-3">
          {[
            { label: 'Chats', value: chatCount },
            { label: 'Disponible', value: `$${pendingBalance.toLocaleString('es-AR')}` }
          ].map((item) => (
            <div
              key={item.label}
              className="flex-1 bg-white/50 backdrop-blur-sm border border-[rgba(196,96,122,.1)] p-3 rounded-2xl text-center shadow-sm"
            >
              <div className="text-[10px] text-[#9a7a84] uppercase font-bold mb-1 tracking-wider">
                {item.label}
              </div>
              <div className="font-serif text-xl font-bold text-[#c4607a]">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        <DailyCard />

        <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#9a7a84] mb-1 mt-3">
          Chats recientes
        </div>

        {conversations.length === 0 ? (
          <div className="text-center text-[#9a7a84] py-10 bg-white/30 rounded-3xl border border-dashed border-pink-200 text-sm italic">
            No hay mensajes aún
          </div>
        ) : (
          conversations.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelectUser(u)}
              className="flex items-center gap-3.5 bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <StoryAvatar
                u={u}
                size={48}
                onStoryClick={setStoryUrl}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] mb-0.5 text-[#2a1a20]">
                  {u.name}
                </div>
                <div className={`text-xs truncate ${u.unread ? 'text-[#2a1a20] font-semibold' : 'text-[#9a7a84]'}`}>
                  {u.preview}
                </div>
              </div>
              
              {u.unread ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shrink-0" />
              ) : (
                <div className="text-[#c4607a] text-lg">›</div>
              )}
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}
// ─── FChats ───────────────────────────────────────────────────────────────────
function FChats({ onSelectUser }) {
  const { user } = useAppStore();
  const conversations = useConversations(user?.id);
  const [storyUrl, setStoryUrl] = useState(null);

  return (
    <div className="px-5 py-2">
      <StoryModal url={storyUrl} onClose={() => setStoryUrl(null)} />
      {conversations.length === 0
        ? <div className="text-center text-[#9a7a84] py-10 text-sm">No hay chats aún</div>
        : conversations.map(u => (
          <div key={u.id} onClick={() => onSelectUser(u)} className="flex items-center gap-3.5 py-3.5 border-b border-[rgba(196,96,122,.15)] cursor-pointer">
            <StoryAvatar u={u} size={48} onStoryClick={setStoryUrl} />
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

// ─── FEarn ────────────────────────────────────────────────────────────────────
function FEarn() {
  const { user } = useAppStore();
  const [stats, setStats] = useState({ balance: 0, gifts: 0, conversations: 0, admirers: 0 });
  const [loading, setLoading] = useState(true);

 useEffect(() => { loadStats(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadStats() {
    if (!user?.id) { setLoading(false); return; }
    try {
      const { data: balanceData, error: balanceError } = await supabase.from('creator_balances').select('pending_balance').eq('creator_id', user.id).maybeSingle();
      if (balanceError) throw balanceError;
      const { data: transactions, error: transactionsError } = await supabase.from('transactions').select('type').eq('creator_id', user.id);
      if (transactionsError) throw transactionsError;
      const totalGifts = transactions?.filter(t => t.type === 'gift').length || 0;
      const { data: messagesData, error: messagesError } = await supabase.from('messages').select('sender_id').eq('receiver_id', user.id);
      if (messagesError) throw messagesError;
      const uniqueUsers = new Set(messagesData?.map(m => m.sender_id));
      setStats({ balance: Number(balanceData?.pending_balance || 0), gifts: totalGifts, conversations: uniqueUsers.size, admirers: uniqueUsers.size });
    } catch (err) { console.error('Error cargando estadísticas:', err); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-[#c4607a] text-lg">Cargando estadísticas...</span></div>;

  const rows = [['✨ Regalos recibidos', stats.gifts], ['💬 Conversaciones totales', stats.conversations], ['⭐ Nuevos admiradores', stats.admirers]];

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
        {rows.map(([label, value], i) => (
          <div key={label} className={`flex justify-between py-3 ${i < rows.length - 1 ? 'border-b border-[rgba(196,96,122,.15)]' : ''}`}>
            <span className="text-[#9a7a84]">{label}</span>
            <span className="font-medium text-[#2a1a20]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FProfile ─────────────────────────────────────────────────────────────────
function FProfile({ onLogout }) {
  const { user, setUser } = useAppStore();
  const [view, setView] = useState('menu');
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

  if (view === 'privacy') return (
    <div className="p-5 flex flex-col bg-[#fdf6f0] overflow-y-auto min-h-full">
      <button onClick={() => setView('menu')} className="self-start mb-4 text-[#c4607a]">← Volver</button>
      <h2 className="font-serif text-2xl mb-4">Seguridad</h2>
      <div className="mb-4"><VerificationStatus theme="light" /></div>
      <div className="bg-[#fff1f1] p-5 rounded-3xl border border-red-100">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Centro de Ayuda</h3>
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=support.evaapp@gmail.com', '_blank')} className="w-full py-3 bg-[#c4607a] text-white rounded-2xl text-sm font-semibold">Email Soporte 📧</button>
          <button onClick={() => window.open('https://wa.me/541168892507', '_blank')} className="w-full py-3 bg-[#25D366] text-white rounded-2xl text-sm font-semibold">WhatsApp 💬</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-5 pt-6 flex flex-col gap-4 bg-[#fdf6f0] h-full">
      <div className="text-center mb-2">
        <div className="flex justify-center mb-3.5"><AvatarUpload size="lg" /></div>
        <div className="flex items-center justify-center gap-2 mt-1">
          {isEditing ? (
            <input value={name} autoFocus onChange={e => setName(e.target.value)} onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()} className="font-serif text-2xl font-semibold text-center bg-white text-[#2a1a20] px-3 py-1 rounded-lg outline-none border border-[#c4607a]" />
          ) : (
            <div className="font-serif text-2xl font-semibold">{user?.display_name || ''}</div>
          )}
          <button onClick={() => setIsEditing(true)} className="text-[#9a7a84] hover:text-[#c4607a] bg-transparent border-none cursor-pointer">✏️</button>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#e0f2fe] rounded-full px-4 py-1.5 mt-2.5 text-sm text-[#0369a1] font-medium">✅ Perfil Verificado</div>
      </div>

      <div className="bg-[#fff9f5] border border-[rgba(196,96,122,.15)] rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9a7a84] mb-3">Segunda foto de perfil</p>
        <CoverUpload />
        <p className="text-[10px] text-[#9a7a84] mt-2 text-center">Los usuarios la ven al mantener presionada tu card</p>
      </div>

      <div className="bg-[#0d0d0d] border border-[rgba(240,240,242,0.25)] rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">✨ Así te ven los usuarios + Tu EvaStory</p>
        <div className="w-1/2 mx-auto">
          <CreatorCard g={{ id: user.id, display_name: user.display_name, avatar_url: user.avatar_url, cover_url: user.cover_url, video_url: user.video_url }} onSelectGirl={() => {}} />
        </div>
        <p className="text-[10px] text-white/40 mt-2 text-center">Mantené presionada para ver tu segunda foto</p>
      </div>

      <div className="flex gap-3 mt-auto mb-10">
        <button onClick={() => setView('privacy')} className="flex-1 py-3.5 bg-transparent border border-[#c4607a] rounded-full text-[#c4607a] text-[14px] cursor-pointer font-medium active:scale-95 transition-transform">🔒 Seguridad</button>
        <button onClick={onLogout} className="flex-1 py-3.5 bg-transparent border border-[#c4607a] rounded-full text-[#c4607a] text-[14px] cursor-pointer font-medium active:scale-95 transition-transform">Cerrar sesión</button>
      </div>
    </div>
  );
}