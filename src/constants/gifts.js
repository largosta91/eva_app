// src/constants/gifts.js
// Fuente de verdad para los regalos de Eva.
// Los sonidos se resuelven en GiftPanel.jsx porque usan import.meta.url (Vite).

import { Video } from "lucide-react";

export const GIFTS = [
  { id: 1,  name: "Beso",        emoji: "💋", image: "/kiss.gif",              cost: 5,      color: "#ff6b8a", soundKey: "basico"   },
  { id: 2,  name: "Fuego",       emoji: "🔥", image: "/fuegoTenor.gif",        cost: 10,     color: "#ff4500", soundKey: "basico"   },
  { id: 3,  name: "Corazón",     emoji: "❤️", image: "/corazónTenor.gif",      cost: 15,     color: "#ff0000", soundKey: "basico"   },
  { id: 4,  name: "Rosa",        emoji: "🌹", image: "/rosaTenor.webp",        cost: 25,     color: "#ff007f", soundKey: "rosa"     },
  { id: 5,  name: "Copa",        emoji: "🍷", image: "/copaTenor.webp",        cost: 50,     color: "#9b2335", soundKey: "copa"     },
  { id: 6,  name: "Diamante",    emoji: "💎", image: "/diamanteTenor.webp",    cost: 100,    color: "#7c3aed", soundKey: "diamante" },
  { id: 7,  name: "Anillo",      emoji: "💍", image: "/anilloTenor.gif",       cost: 250,    color: "#fbbf24", soundKey: "corona"   },
  { id: 8,  name: "ORO",         emoji: "💰", image: "/lluviadeoro.gif",       cost: 1000,   color: "#c9a84c", soundKey: "oro"      },


  { id: 10, name: "dolar",       emoji: "💵", image: "/dolar.gif",             cost: 2000,   color: "#22c55e", soundKey: "oro"    },
  { id: 11, name: "Auto",        emoji: "🏎️", image: "/car1.gif",              cost: 3500,   color: "#ef4444", soundKey: "auto"     },
  { id: 12, name: "Yate",        emoji: "🛥️", image: "/yate.gif",              cost: 5000,   color: "#0ea5e9", soundKey: "epico"    },
  { id: 13, name: "Helicóptero", emoji: "🚁", image: "/helicoptero.gif",       cost: 7500,   color: "#64748b", soundKey: "epico"    },
  { id: 14, name: "Avión",       emoji: "✈️", image: "/avioneta.webp",             cost: 10000,  color: "#38bdf8", soundKey: "epico"},
  { id: 15, name: "Mansión",     emoji: "🏛️", image: "/mansion.png",           cost: 15000,  color: "#f59e0b", soundKey: "legend"   },
  { id: 9,  name: "Corona",      emoji: "👑", image: "/corona.webp",            cost: 1500,   color: "#ffd700", soundKey: "corona"  },
  { id: 16, name: "Copa de Oro", emoji: "🏆", image: "/copadeoro.webp",         cost: 25000,  color: "#eab308", soundKey: "legend"  },
  { id: 17, name: "Unicornio",   emoji: "🦄", image: "/unicornio.gif",         cost: 50000,  color: "#c084fc", soundKey: "unicornio"   },
  { id: 18, name: "Ave Fénix",   emoji: "🦅", image: "/fenix.mp4",        cost: 100000, color: "#f97316", soundKey: "sonidoFenix"   },
];