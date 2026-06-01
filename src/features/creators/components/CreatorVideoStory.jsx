// ─── CreatorVideoStory.jsx ─────────────────────────────────────────────────
// Maneja subida y reproducción del video de presentación de la creadora
// El video vive dentro del avatar con anillo animado estilo Instagram

import { useRef, useState } from 'react';
import { supabase } from '../../../services/api/supabase';
import useAppStore from '../../../app/store/useAppStore';

// ─── Anillo animado ───────────────────────────────────────────────────────────
export function StoryRing({ hasVideo, size = 44, children, onClick }) {
  if (!hasVideo) return <div style={{ width: size, height: size }}>{children}</div>;

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding: 4,
        background: 'linear-gradient(135deg, #c4607a, #833AB4, #FCAF45)',
        backgroundSize: '200% 200%',
        animation: 'storyRingSpin 3s linear infinite',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: 2, background: '#fff9f5' }}>
        {children}
      </div>
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

// ─── Modal fullscreen del video ───────────────────────────────────────────────
export function StoryModal({ videoUrl, isOpen, onClose }) {
  if (!isOpen || !videoUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <video
        src={videoUrl}
        autoPlay
        playsInline
        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 16 }}
        onEnded={onClose}
        onClick={e => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: 'white', borderRadius: '50%', width: 36, height: 36,
          fontSize: 18, cursor: 'pointer'
        }}
      >✕</button>
    </div>
  );
}

// ─── Hook para subir el video ─────────────────────────────────────────────────
export function useVideoUpload() {
  const { user, setUser } = useAppStore();
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    if (!file || !user?.id) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('El video es muy pesado. Máximo 15MB.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/presentation.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.from('users').update({ video_url: publicUrl }).eq('id', user.id);
      setUser({ ...user, video_url: publicUrl });
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}