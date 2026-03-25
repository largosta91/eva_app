import { useState } from "react";

export default function useToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  const show = (message, duration = 3000) => {
    setMsg(message);
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  };

  return { msg, visible, show };
}