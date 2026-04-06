// src/features/users/components/ProfileTab.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

const SUPPORT_EMAIL = 'support.evaapp@gmail.com';

function SupportForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Asunto"
        className="bg-[#09080f] text-[#ede8ff] placeholder-[#7a748f] px-4 py-3 rounded-xl outline-none border border-[rgba(201,168,76,.14)] focus:border-[#c9a84c] text-sm"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describí tu problema..."
        rows={4}
        className="bg-[#09080f] text-[#ede8ff] placeholder-[#7a748f] px-4 py-3 rounded-xl outline-none border border-[rgba(201,168,76,.14)] focus:border-[#c9a84c] text-sm resize-none"
      />
      <button
        onClick={handleSend}
        className="bg-[#c9a84c] text-[#09080f] py-3 rounded-xl font-bold text-sm"
      >
        Enviar al soporte
      </button>
    </div>
  );
}

export default function ProfileTab({ onLogout }) {
  const { credits } = useAppStore();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [name, setName] = useState("Usuario");
  const [isEditing, setIsEditing] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  const saveName = () => setIsEditing(false);

  return (
    <div className="px-6 pt-5 pb-32 flex flex-col overflow-y-auto animate-fadeIn">

      {/* HEADER */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-[#1a1826] border-2 border-[#c9a84c] flex items-center justify-center overflow-hidden">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-5xl">👤</span>
            }
          </div>
          <label className="absolute bottom-1 right-1 bg-[#c9a84c] text-[#09080f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
                className="text-2xl font-semibold text-center bg-[#1a1826] text-[#ede8ff] px-3 py-1 rounded-lg outline-none border border-[#c9a84c]"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-[#ede8ff]">{name}</h2>
            )}
            <button onClick={() => setIsEditing(true)} className="text-[#7a748f] hover:text-[#c9a84c]">✏️</button>
          </div>
          <p className="text-[#7a748f] text-[11px] uppercase tracking-[3px] mt-1 font-bold">Mi Perfil</p>
        </div>
      </div>

      {/* CREDITOS */}
      <div className="bg-[#1a1826] rounded-3xl p-6 mb-3 flex items-center justify-between">
        <div>
          <p className="text-[#7a748f] text-xs uppercase font-bold">Diamantes</p>
          <p className="text-3xl font-bold text-[#c9a84c] mt-1">💎 {credits}</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.PAYWALL)}
          className="bg-[#c9a84c] text-[#09080f] px-6 py-3 rounded-xl font-bold"
        >
          CARGAR
        </button>
      </div>

      // SOPORTE
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

    </div>
  );
}