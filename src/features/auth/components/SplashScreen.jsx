import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ROUTES } from '../../../constants/routes';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 275);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-between relative overflow-hidden py-16"
      style={{ background: 'radial-gradient(ellipse 100% 70% at 50% 0%, #1a1030 0%, #09080f 70%)' }}
    >

      {/* Partículas decorativas de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[12%] left-[18%] w-[1px] h-[1px] rounded-full bg-[#c9a84c] opacity-60"
          style={{ boxShadow: '0 0 6px 2px rgba(201,168,76,0.4)' }} />
        <div className="absolute top-[22%] right-[22%] w-[1px] h-[1px] rounded-full bg-[#8b3a9c] opacity-50"
          style={{ boxShadow: '0 0 8px 3px rgba(139,58,156,0.35)' }} />
        <div className="absolute top-[38%] left-[10%] w-[1px] h-[1px] rounded-full bg-[#c9a84c] opacity-30"
          style={{ boxShadow: '0 0 5px 2px rgba(201,168,76,0.25)' }} />
        <div className="absolute bottom-[30%] right-[12%] w-[1px] h-[1px] rounded-full bg-[#8b3a9c] opacity-40"
          style={{ boxShadow: '0 0 7px 3px rgba(139,58,156,0.3)' }} />
      </div>

      {/* Glow superior */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,58,156,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)'
        }}
      />

      {/* Bloque central */}
      <div
        className="flex flex-col items-center z-10 mt-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        {/* Logo con anillo degradado tipo Instagram */}
        <div className="relative mb-8">
          {/* Anillo exterior degradado */}
          <div
            className="w-24 h-24 rounded-full p-[3px]"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #8b3a9c, #c9a84c)' }}
          >
            {/* Separador negro */}
            <div className="w-full h-full rounded-full p-[2px] bg-[#09080f]">
              {/* Imagen */}
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src="/goldAppel.png"
                  alt="Eva logo"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 30%' }}
                />
              </div>
            </div>
          </div>

          {/* Glow detrás del logo */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: '0 0 40px 8px rgba(139,58,156,0.25), 0 0 80px 20px rgba(201,168,76,0.1)',
            }}
          />
        </div>

        {/* Nombre */}
        <div
          className="font-serif text-7xl font-semibold tracking-tight leading-none mb-3"
          style={{
            background: 'linear-gradient(135deg, #8b3a9c, #c9a84c)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Eva
        </div>

        {/* Tagline */}
        <div
          className="text-[10px] tracking-[4px] uppercase"
          style={{ color: '#5a5078' }}
        >
          conexiones que importan
        </div>
      </div>

      {/* Línea separadora decorativa */}
      <div
        className="w-16 h-px my-auto z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.2s ease 0.4s'
        }}
      />

      {/* Botones inferiores */}
      <div
        className="flex flex-col items-center gap-4 z-10 w-full px-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s'
        }}
      >
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full max-w-xs py-4 rounded-full font-semibold text-[15px] text-[#09080f] cursor-pointer relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #f0d882, #c9a84c)',
            boxShadow: '0 8px 32px rgba(201,168,76,0.35), 0 2px 8px rgba(0,0,0,0.4)',
            letterSpacing: '0.5px'
          }}
        >
          Entrar
        </button>

        <div className="text-sm" style={{ color: '#3d3855' }}>
          <span style={{ color: '#D4AF37' }}>•</span> ¿Ya eres parte?{' '}
          <span style={{ color: '#D4AF37' }}>•</span>
        </div>
      </div>

    </div>
  );
}