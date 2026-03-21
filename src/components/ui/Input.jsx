// 📁 src/components/ui/Input.jsx
// Campo de texto reutilizable con soporte para íconos, errores y dos temas.
// Uso: <Input theme="dark" placeholder="Email" value={val} onChange={fn} />
//
// Props:
//   theme      → 'dark' (masculino, fondo #09080f) | 'light' (femenino, fondo #fdf6f0)
//   icon       → JSX del ícono a la izquierda (opcional)
//   rightIcon  → JSX del ícono a la derecha (opcional)
//   error      → string con mensaje de error (opcional)

export default function Input({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  type = 'text',
  icon = null,
  rightIcon = null,
  error = '',
  disabled = false,
  className = '',
  theme = 'dark',
}) {

  // Cada tema tiene su propio juego de colores
  // Dark  → fondo oscuro con borde dorado al enfocarse
  // Light → fondo crema con borde rosa al enfocarse
  const themes = {
    dark: {
      wrapper:     'bg-[#1a1826]',
      border:      'border-[rgba(201,168,76,.14)]',
      borderFocus: 'focus:border-[#c9a84c]',
      text:        'text-[#ede8ff]',
      placeholder: 'placeholder-[#7a748f]',
    },
    light: {
      wrapper:     'bg-[#f5ece6]',
      border:      'border-[rgba(196,96,122,.15)]',
      borderFocus: 'focus:border-[#c4607a]',
      text:        'text-[#2a1a20]',
      placeholder: 'placeholder-[#9a7a84]',
    },
  };

  const t = themes[theme];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="relative flex items-center">

        {/* Ícono izquierdo — desplaza el texto para que no se superponga */}
        {icon && (
          <span className="absolute left-4 text-[#7a748f] pointer-events-none">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full rounded-full border px-5 py-3 text-sm outline-none
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${t.wrapper} ${t.border} ${t.borderFocus} ${t.text} ${t.placeholder}
            ${icon      ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
            ${error     ? '!border-red-500' : ''}
          `}
        />

        {/* Ícono derecho — útil para mostrar/ocultar contraseña */}
        {rightIcon && (
          <span className="absolute right-4 text-[#7a748f] cursor-pointer">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Mensaje de error debajo del input */}
      {error && (
        <p className="text-red-400 text-xs pl-4 mt-0.5">{error}</p>
      )}
    </div>
  );
}