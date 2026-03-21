// 📁 src/components/ui/Badge.jsx
// Etiqueta pequeña para estados, categorías y notificaciones.
// Pensala como una "pegatina" que se pone arriba de otras cosas.
//
// Uso: <Badge variant="gold">⭐ TOP</Badge>
//      <Badge variant="pink">Nuevo</Badge>
//      <Badge variant="green">En línea</Badge>
//
// Variantes:
//   gold    → fondo dorado translúcido (#c9a84c) — para "TOP", "VIP", badges masculinos
//   pink    → gradiente rosa (#c4607a → #e8a0b0) — para "Nuevo", badges femeninos
//   green   → fondo verde translúcido            — para estado "online"
//   red     → fondo rojo translúcido             — para alertas o "offline"
//   default → fondo blanco muy transparente      — para tags neutrales
//   outline → solo borde, sin relleno            — para tags secundarios

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) {

  const variantClasses = {
    default: 'bg-white/10 text-white/80 border border-white/15',
    gold:    'bg-[rgba(201,168,76,.2)] border border-[rgba(201,168,76,.4)] text-[#e8c97a]',
    green:   'bg-green-500/20 border border-green-500/40 text-green-400',
    red:     'bg-red-500/20   border border-red-500/40   text-red-400',
    outline: 'bg-transparent  border border-white/20     text-white/70',
    // pink usa gradiente inline — se define abajo
    pink:    'text-white border-none',
  };

  const sizeClasses = {
    xs: 'text-[9px]  px-2   py-0.5',
    sm: 'text-[10px] px-2.5 py-0.5',
    md: 'text-xs     px-3   py-1',
  };

  // Solo pink necesita gradiente inline porque Tailwind no puede
  // generar gradientes dinámicos sin configuración previa
  const inlineStyle = variant === 'pink'
    ? { background: 'linear-gradient(135deg, #c4607a, #e8a0b0)' }
    : {};

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold tracking-wide
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={inlineStyle}
    >
      {children}
    </span>
  );
}