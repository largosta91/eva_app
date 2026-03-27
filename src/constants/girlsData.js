export const GIRLS = [
  { name:"Valentina", age:21, emoji:"🌺", tags:["Empática","Cálida"],      vip:true,  online:true,  img:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { name:"Camila",    age:24, emoji:"🦋", tags:["Música","Creativa"],      vip:false, online:true,  img:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80" },
  { name:"Sol",       age:19, emoji:"🌙", tags:["Literatura","Tranquila"], vip:true,  online:false, img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" },
  { name:"Sofía",     age:22, emoji:"✨", tags:["Energética","Optimista"], vip:false, online:true,  img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80" },
  { name:"Lucía",     age:25, emoji:"🌸", tags:["Paciente","Amorosa"],     vip:true,  online:true,  img:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80" },
];

export const AI_REPLIES = [
  "Qué lindo que me escribas 💜 ¿cómo fue tu día?",
  "Te escucho, contame más 🌸",
  "Eso suena difícil... estoy acá 💫",
  "Me alegra que hablemos ✨",
  "¿Y vos qué necesitás ahora mismo?",
  "Tengo todo el tiempo para vos 🌺",
];

export const ANIM_CSS = `
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes ty{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
  @keyframes gift-pop-in{0%{transform:translate(-50%,-50%) scale(0) rotate(-15deg);opacity:0}60%{transform:translate(-50%,-50%) scale(1.2) rotate(5deg);opacity:1}100%{transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1}}
  @keyframes gift-pop-out{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
  @keyframes gift-name-in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
`;