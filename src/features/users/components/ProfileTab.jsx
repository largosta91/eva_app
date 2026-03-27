import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

export default function ProfileTab({ onLogout }) {
  const { credits } = useAppStore();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    <div className="px-6 pt-5 pb-32 flex flex-col overflow-y-auto animate-fadeIn">
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-[#1a1826] border-2 border-[#c9a84c] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-5xl">👤</span>
            }
          </div>
          <label className="absolute bottom-1 right-1 bg-[#c9a84c] text-[#09080f] w-8 h-8 rounded-full border-2 border-[#09080f] flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-semibold text-[#ede8ff]">Usuario</h2>
            <button className="text-[#7a748f] text-sm">✏️</button>
          </div>
          <p className="text-[#7a748f] text-[11px] uppercase tracking-[3px] mt-1 font-bold">Mi Perfil</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1a1826] to-[#111018] border border-[rgba(201,168,76,0.2)] rounded-3xl p-6 mb-3 flex items-center justify-between shadow-xl">
        <div>
          <p className="text-[#7a748f] text-xs uppercase font-bold tracking-wider">Diamantes</p>
          <p className="text-3xl font-bold text-[#c9a84c] mt-1">💎 {credits}</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.PAYWALL)}
          className="bg-[#c9a84c] text-[#09080f] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(201,168,76,0.3)] active:scale-95 transition-transform cursor-pointer"
        >
          CARGAR
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button className="w-full bg-[#1a1826] border border-[rgba(201,168,76,0.1)] py-5 px-6 rounded-2xl flex items-center justify-between group active:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🎧</span>
            <div className="text-left">
              <p className="text-[#ede8ff] text-[16px] font-semibold">Soporte Técnico</p>
              <p className="text-[#7a748f] text-xs">Reportar problemas con pagos</p>
            </div>
          </div>
          <span className="text-[#5a5470] text-xl">›</span>
        </button>

        <button
          onClick={onLogout}
          className="mt-4 w-full py-4 text-[#5a5470] text-[13px] font-medium hover:text-red-400 transition-colors cursor-pointer"
        >
          Cerrar sesión segura
        </button>
      </div>

      <p className="mt-8 text-[9px] text-[#423d57] text-center uppercase tracking-[3px]">
        Eva App v1.0.2
      </p>
    </div>
  );
}