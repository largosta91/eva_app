// 📁 src/components/ui/Button.jsx
// Botón reutilizable con variantes para ambas interfaces de Eva.
// Uso: <Button variant="primary" size="lg" fullWidth onClick={fn}>Entrar</Button>
//
// Variantes disponibles:
//   primary  → dorado  (#c9a84c → #f0d882) — para la interfaz masculina
//   secondary→ rosa    (#c4607a → #e8a0b0) — para la interfaz femenina
//   outline  → borde translúcido sin fondo  — para botones secundarios
//   ghost    → sin fondo ni borde           — para acciones discretas

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
}) {

  // Estilos base compartidos por todas las variantes
  const base = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-full border-none cursor-pointer
    transition-all duration-200 active:scale-95 select-none
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Clases Tailwind por variante (colores que no dependen de gradiente)
  const variantClasses = {
    primary:   'text-[#09080f] shadow-[0_8px_30px_rgba(201,168,76,.35)]',
    secondary: 'text-white    shadow-[0_8px_30px_rgba(196,96,122,.35)]',
    outline:   'bg-transparent border border-white/20 text-[#ede8ff] hover:bg-white/5',
    ghost:     'bg-transparent text-[#7a748f] hover:text-[#c9a84c]',
  };

  // Tamaños de padding y fuente
  const sizeClasses = {
    sm: 'text-xs  px-4 py-2',
    md: 'text-sm  px-6 py-3',
    lg: 'text-base px-8 py-4',
  };

  // Gradientes aplicados como estilo inline porque Tailwind no soporta
  // gradientes dinámicos sin configuración extra
  const backgroundGradients = {
    primary:   'linear-gradient(135deg, #c9a84c, #f0d882)',
    secondary: 'linear-gradient(135deg, #c4607a, #e8a0b0)',
    outline:   'none',
    ghost:     'none',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: backgroundGradients[variant] }}
      className={`
        ${base}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}