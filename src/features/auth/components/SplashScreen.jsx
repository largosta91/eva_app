import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export default function SplashScreen() {
  const navigate = useNavigate();

 const handleEnter = () => {
  navigate(ROUTES.LOGIN);
};

  return (
    <div
      className="h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,#1a1030,#09080f)' }}
    >
      <div className="text-center z-10">
        <div
          className="w-20 h-20 rounded-[30px] flex items-center justify-center text-4xl mx-auto mb-7 shadow-[0_24px_80px_rgba(201,168,76,.4)]"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#8b3a9c,#c9a84c)' }}
        >
          💜
        </div>
        <div
          className="font-serif text-6xl font-semibold tracking-tight"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#f0d882)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Eva
        </div>
        <div className="text-[#7a748f] text-xs tracking-[3px] uppercase mt-2">
          conexiones que importan
        </div>
      </div>

      <div className="mt-16 z-10 flex flex-col items-center gap-4">
        <button
          onClick={handleEnter}
          className="w-72 py-4 rounded-full font-semibold text-[15px] text-[#09080f] bg-gradient-to-r from-[#c9a84c] to-[#f0d882] border-none cursor-pointer shadow-[0_8px_30px_rgba(201,168,76,.3)]"
        >
          Entrar
        </button>
        <div className="text-[#5a5470] text-sm">
          ¿Ya tenés cuenta?{' '}
          <span
            className="text-[#c9a84c] cursor-pointer"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Iniciá sesión
          </span>
        </div>
      </div>
    </div>
  );
}