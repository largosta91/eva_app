import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';

export default function RegisterForm() {
  const navigate = useNavigate();
  const setUser = useAppStore(s => s.setUser);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Completá todos los campos');
      return;
    }
    if (!accepted) {
      setError('Debés aceptar los Términos y Condiciones para continuar');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.name, role: 'user' } }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setUser({ id: data.user.id, name: form.name, role: 'user' });
    navigate(ROUTES.USER_HOME);
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,#1a1030,#09080f)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <div
            className="font-serif text-4xl font-semibold mb-1"
            style={{ background: 'linear-gradient(135deg,#8b3a9c,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Eva
          </div>
          <p className="text-[#c9a84c] text-sm">Creá tu cuenta</p>
        </div>

        <div className="flex flex-col gap-3">
          <input name="name" placeholder="Tu nombre" value={form.name} onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c9a84c]" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c9a84c]" />
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c9a84c]" />
          {error && <p className="text-red-400 text-xs px-2">{error}</p>}
        </div>

        {/* ✅ Checkbox términos */}
        <div className="flex items-start gap-3 px-1">
          <input
            type="checkbox"
            id="terms"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            className="mt-0.5 accent-[#c9a84c] w-4 h-4 shrink-0 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-[#7a748f] leading-relaxed cursor-pointer">
            Confirmo que tengo +18 años y acepto los{' '}
            <span
              onClick={() => window.open('/terms', '_blank')}
              className="text-[#c9a84c] underline cursor-pointer"
            >
              Términos y Condiciones
            </span>{' '}
            y la{' '}
            <span
              onClick={() => window.open('/privacy', '_blank')}
              className="text-[#c9a84c] underline cursor-pointer"
            >
              Política de Privacidad
            </span>
          </label>
        </div>

        <button onClick={handleRegister} disabled={loading}
          className="w-full py-4 rounded-full font-semibold text-[15px] text-[#09080f] bg-gradient-to-r from-[#c9a84c] to-[#f0d882] border-none cursor-pointer shadow-[0_8px_30px_rgba(201,168,76,.3)] disabled:opacity-60">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <div className="text-center text-sm text-[#5a5470]">
          ¿Ya tenés cuenta?{' '}
          <button onClick={() => navigate(ROUTES.LOGIN)}
            className="text-[#c9a84c] bg-transparent border-none cursor-pointer text-sm p-0">
            Iniciá sesión
          </button>
        </div>

      </div>
    </div>
  );
}