import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';

export default function ProfileTab({ onLogout }) {
  const { credits, user, setUser } = useAppStore();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [name, setName] = useState(user?.display_name || 'Usuario');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (user?.display_name) {
      setName(user.display_name);
    }
  }, [user?.display_name]);

  // ─── Recarga video fresco desde Supabase al montar ───────────────────────
  useEffect(() => {
    const loadFreshStory = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('users')
        .select('video_url, video_created_at')
        .eq('id', user.id)
        .single();
      if (error || !data) return;
      setUser(prev => ({
        ...prev,
        video_url: data.video_url || null,
        video_created_at: data.video_created_at || null,
      }));
    };
    loadFreshStory();
  }, [user?.id, setUser]);

  // ─── Expiración 24hs ──────────────────────────────────────────────────────
  const isExpired =
    user?.video_created_at &&
    Date.now() - new Date(user.video_created_at).getTime() > 24 * 60 * 60 * 1000;
  const hasVideo = !!user?.video_url && !isExpired;

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      if (dbError) throw dbError;
      setUser({ ...user, avatar_url: publicUrl });
    } catch (err) {
      console.error('Error subiendo foto:', err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ─── Subir video ──────────────────────────────────────────────────────────
  const handleVideo = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !user?.id) return;
    setUploadingVideo(true);
    try {
      const ext = f.name.split('.').pop();
      const path = `${user.id}/presentation.${ext}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, f, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      const now = new Date().toISOString();
      await supabase
        .from('users')
        .update({ video_url: publicUrl, video_created_at: now })
        .eq('id', user.id);
      setUser(prev => ({
        ...prev,
        video_url: publicUrl,
        video_created_at: now,
      }));
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setUploadingVideo(false);
    }
  };

  const saveName = async () => {
    setIsEditing(false);
    if (!name.trim() || name === user?.display_name) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: name.trim() })
        .eq('id', user.id);
      if (error) throw error;
      setUser({ ...user, display_name: name.trim() });
    } catch (err) {
      console.error('Error guardando nombre:', err.message);
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="px-6 pt-5 pb-32 flex flex-col overflow-y-auto animate-fadeIn">

      {/* ─── Modal video fullscreen ───────────────────────────────────────── */}
      {showVideo && hasVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <video
            src={user.video_url}
            autoPlay
            playsInline
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 16 }}
            onEnded={() => setShowVideo(false)}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setShowVideo(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', borderRadius: '50%', width: 36, height: 36,
              fontSize: 18, cursor: 'pointer'
            }}
          >✕</button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative" style={{ width: 112, height: 112 }}>

          {/* ─── Anillo animado si tiene story ───────────────────────────── */}
          <div
            onClick={() => hasVideo && setShowVideo(true)}
            style={{
              width: '100%', height: '100%', borderRadius: '50%',
              padding: hasVideo ? 3 : 0,
              background: hasVideo
                ? 'linear-gradient(135deg, #c4607a, #833AB4, #FCAF45)'
                : 'transparent',
              animation: hasVideo ? 'storyRingSpin 3s linear infinite' : 'none',
              backgroundSize: '200% 200%',
              cursor: hasVideo ? 'pointer' : 'default',
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: '#1a1826',
                border: hasVideo ? '3px solid #09080f' : '2px solid #c9a84c',
              }}
            >
              {uploadingPhoto
                ? <span className="text-2xl animate-pulse">⏳</span>
                : user?.avatar_url
                  ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-5xl">👤</span>
              }
            </div>
          </div>

          {/* Botón foto 📷 */}
          <label
            className={`absolute bottom-1 right-1 bg-[#c9a84c] text-[#09080f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ zIndex: 3 ,
              border: '2px solid #09080f',}}
          >
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>

          {/* Botón video 🎥 */}
<button
  onClick={() => videoRef.current?.click()}
  className="absolute flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
  style={{
    bottom: 4, left: 0,
    width: 32, height: 32,
    fontSize: 14,
    background: uploadingVideo
      ? 'rgba(201, 168, 76, 0.5)'
      : '#c9a84c',
    border: '2px solid #09080f',
    zIndex: 3
  }}
>
  {uploadingVideo ? '⏳' : '🎥'}
</button>

          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
                className="text-2xl font-semibold text-center bg-[#1a1826] text-[#ede8ff] px-3 py-1 rounded-lg outline-none border border-[#c9a84c]"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-[#ede8ff]">
                {user?.display_name || 'Usuario'}
              </h2>
            )}
            <button
              onClick={() => setIsEditing(true)}
              disabled={savingName}
              className="text-[#7a748f] hover:text-[#c9a84c] disabled:opacity-50"
            >
              {savingName ? '💾' : '✏️'}
            </button>
          </div>
          <p className="text-[#7a748f] text-[11px] uppercase tracking-[3px] mt-1 font-bold">Mi Perfil</p>
        </div>
      </div>

      {/* CREDITOS */}
      <div className="bg-[#1a1826] rounded-3xl p-6 mb-3 flex items-center justify-between">
        <div>
          <p className="text-[#7a748f] text-xs uppercase font-bold">Mis Diamantes</p>
          <p className="text-3xl font-bold text-[#c9a84c] mt-1">💎 {credits}</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.PAYWALL)}
          className="bg-[#c9a84c] text-[#09080f] px-6 py-3 rounded-xl font-bold"
        >
          CARGAR
        </button>
      </div>

      {/* SOPORTE */}
      <div className="bg-[#1a1826] rounded-3xl p-6 mb-3 flex items-center justify-between">
        <div>
          <p className="text-[#7a748f] text-xs uppercase font-bold">Soporte</p>
          <p className="text-lg font-bold text-[#ede8ff] mt-1">¿Necesitás ayuda?</p>
        </div>
        <button
          onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=support.evaapp@gmail.com', '_blank')}
          className="bg-[#c9a84c] text-[#09080f] px-6 py-3 rounded-xl font-bold"
        >
          CONTACTAR
        </button>
      </div>

      {/* LOGOUT */}
      <button onClick={onLogout} className="mt-4 w-full py-4 text-[#5a5470] hover:text-red-400">
        Cerrar sesión segura
      </button>

      <p className="mt-8 text-[9px] text-[#423d57] text-center uppercase tracking-[3px]">
        Eva App v1.0.2
      </p>

      <style>{`
        @keyframes storyRingSpin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

    </div>
  );
}