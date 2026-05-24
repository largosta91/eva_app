import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { ROLES } from '../../../constants/roles';
import { saveRecruiterToken } from '../../../utils/tokenUtils';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';

export default function JoinCreator() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const setUser   = useAppStore(s => s.setUser);
  const [step, setStep]             = useState('loading');
  const [form, setForm]             = useState({ name:'', email:'', password:'' });
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || token.length < 6) {
      setStep('invalid');
      setTimeout(() => navigate(ROUTES.SPLASH, { replace: true }), 2000);
      return;
    }
    supabase.from('recruiter_tokens')
      .select('id, token, used')
      .eq('token', token)
      .eq('used', false)
      .single()
      .then(({ data }) => {
        if (!data) {
          setStep('invalid');
          setTimeout(() => navigate(ROUTES.SPLASH, { replace: true }), 2000);
          return;
        }
        saveRecruiterToken(token);
        setStep('valid');
      });
  }, [token, navigate]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Completá todos los campos');
      return;
    }
    if (form.name.trim().length < 2) {
      setError('El nombre es muy corto');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email inválido');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(
        'https://pjjbksvqxwwibftimrwy.supabase.co/functions/v1/join-creator',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Error al crear cuenta');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setUser({ id: data.user.id, name: form.name.trim(), role: ROLES.CREATOR, recruiterToken: token });
      navigate(ROUTES.CREATOR_HOME);
    } catch {
      setError('Error de red, intentá de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'loading') return <Screen><p className="text-[#c9a84c]">Verificando invitación...</p></Screen>;
  if (step === 'invalid') return <Screen><p className="text-red-400">Link inválido o vencido. Contactá a tu recruiter.</p></Screen>;

  return (
    <Screen>
      <div className="w-full max-w-sm px-6 flex flex-col gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="font-serif text-3xl font-semibold text-[#ede8ff] mb-1">Te esperábamos</h1>
          <p className="text-sm text-[#7a748f]">Creá tu cuenta como talento en Eva</p>
        </div>
        <div className="flex flex-col gap-3">
          <input name="name" placeholder="Tu nombre" value={form.name} onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(196,96,122,.3)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c4607a]" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(196,96,122,.3)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c4607a]" />
          <input name="password" type="password" placeholder="Contraseña (mín. 8 caracteres)" value={form.password} onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(196,96,122,.3)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c4607a]" />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-full font-semibold text-[15px] text-white bg-gradient-to-r from-[#c4607a] to-[#e8a0b0] border-none cursor-pointer disabled:opacity-60">
          {submitting ? 'Creando cuenta...' : 'Crear mi cuenta →'}
        </button>
        <p className="text-[11px] text-[#7a748f] text-center">Al registrarte aceptás los términos y condiciones de Eva</p>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div className="h-screen flex items-center justify-center"
      style={{ background:'radial-gradient(ellipse 80% 60% at 50% 0%,#1a1030,#09080f)' }}>
      {children}
    </div>
  );
}