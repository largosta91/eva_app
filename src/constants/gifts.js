// src/constants/gifts.js
// Fuente de verdad para los regalos de Eva.
// Los sonidos se resuelven en GiftPanel.jsx porque usan import.meta.url (Vite).

export const GIFTS = [
  { id: 1, name: "Beso",     emoji: "💋", cost: 5,    color: "#ff6b8a", soundKey: "basico"  },
  { id: 2, name: "Fuego",    emoji: "🔥", cost: 10,   color: "#ff4500", soundKey: "basico"  },
  { id: 3, name: "Corazón",  emoji: "❤️", cost: 15,   color: "#ff0000", soundKey: "basico"  },
  { id: 4, name: "Rosa",     emoji: "🌹", cost: 25,    color: "#ff007f", soundKey: "rosa"    },
  { id: 5, name: "Copa",     emoji: "🍷", cost: 50,   color: "#9b2335", soundKey: "copa"    },
  { id: 6, name: "Diamante", emoji: "💎", cost: 100,  color: "#7c3aed", soundKey: "diamante"},
  { id: 7, name: "Anillo",   emoji: "💍", cost: 300,  color: "#c9a84c", soundKey: "anillo"  },
  { id: 8, name: "ORO",      emoji: "💰", cost: 1000, color: "#c9a84c", soundKey: "oro"     },
];