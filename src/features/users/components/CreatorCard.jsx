import { useState } from 'react';

export default function CreatorCard({ g, onSelectGirl }) {
  const [flipped, setFlipped] = useState(false);
  const [startX, setStartX] = useState(null);
  const hasCover = !!g.cover_url;

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (hasCover && Math.abs(diff) > 50) {
     setFlipped(diff > 0);
    }
    setStartX(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => hasCover && setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => onSelectGirl({ id: g.id, name: g.display_name, img: g.avatar_url, video_url: g.video_url })}
      className="rounded-[20px] overflow-hidden bg-[#1a1826] border border-[rgba(201,168,76,.14)] aspect-[3/4] relative cursor-pointer hover:scale-[1.02]"
      style={{ transition: 'transform 0.2s' }}
    >
      <img
        src={flipped && hasCover ? g.cover_url : g.avatar_url}
        alt={g.display_name}
        className="w-full h-full object-cover block"
        style={{ transition: 'opacity 0.2s' }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <div className="font-serif text-xl font-semibold text-white mb-0.5">
          {g.display_name}
        </div>
        {hasCover && (
          <div className="text-[10px] text-white/50">Deslizá para ver más</div>
        )}
      </div>
    </div>
  );
}