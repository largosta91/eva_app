// 📁 src/components/ui/Avatar.jsx
// Foto de perfil circular con punto de estado online/offline.
// Si no hay imagen, muestra las iniciales del nombre sobre fondo de color.
//
// Uso: <Avatar src={url} name="Sofía" online={true} size="md" theme="dark" />
//
// Tamaños: sm (32px) | md (48px) | lg (64px) | xl (96px)
// Temas:   dark (interfaz masculina) | light (interfaz femenina)

export default function Avatar({
  src = null,
  name = '',
  online = false,
  size = 'md',
  theme = 'dark',
}) {

  // Dimensiones para cada tamaño
  const sizes = {
    sm: { box: 'w-8  h-8',  text: 'text-xs',  dot: 'w-2   h-2',   border: 'border-[1.5px]' },
    md: { box: 'w-12 h-12', text: 'text-sm',  dot: 'w-2.5 h-2.5', border: 'border-2'       },
    lg: { box: 'w-16 h-16', text: 'text-lg',  dot: 'w-3   h-3',   border: 'border-2'       },
    xl: { box: 'w-24 h-24', text: 'text-2xl', dot: 'w-4   h-4',   border: 'border-[3px]'   },
  };

  // Colores del fondo de iniciales y del borde del punto de online
  const themes = {
    dark:  { bg: 'bg-[#232134]', text: 'text-[#c9a84c]', dotBorder: 'border-[#09080f]' },
    light: { bg: 'bg-[#ede0d8]', text: 'text-[#c4607a]', dotBorder: 'border-[#fdf6f0]' },
  };

  const s = sizes[size];
  const t = themes[theme];

  // Extrae hasta 2 iniciales del nombre (ej: "Sofía García" → "SG")
  const initials = name
    ? name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className={`relative flex-shrink-0 ${s.box}`}>

      {src ? (
        // Caso 1: hay URL de imagen → la mostramos
        <img
          src={src}
          alt={name || 'avatar'}
          className={`${s.box} rounded-full object-cover`}
        />
      ) : (
        // Caso 2: sin imagen → mostramos iniciales sobre fondo de color
        <div className={`${s.box} ${t.bg} ${t.text} ${s.text} rounded-full flex items-center justify-center font-semibold select-none`}>
          {initials}
        </div>
      )}

      {/* Punto verde de "en línea" — solo se muestra si online === true */}
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${s.dot} bg-green-500 rounded-full ${s.border} ${t.dotBorder}`}
          style={{ animation: 'blink 2s infinite' }}
        />
      )}
    </div>
  );
}