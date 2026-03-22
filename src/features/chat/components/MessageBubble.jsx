export default function MessageBubble({ message, theme = "dark" }) {
  const isMe = message.sender === "me" || message.who === "me";
  const isGift = message.type === "gift";

  // Burbuja de regalo
  if (isGift) {
    return (
      <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 16px",
            borderRadius: "16px",
            background: isMe
              ? "linear-gradient(135deg, #c9a84c22, #c9a84c44)"
              : "rgba(255,255,255,0.07)",
            border: `1px solid ${message.giftColor || "#c9a84c"}66`,
            minWidth: "80px",
          }}
        >
          <span style={{ fontSize: "36px", lineHeight: 1 }}>{message.text.split(" ")[0]}</span>
          <span style={{
            fontSize: "11px",
            color: message.giftColor || "#c9a84c",
            fontWeight: 600,
            marginTop: "4px",
          }}>
            {message.text.split(" ").slice(1).join(" ")}
          </span>
        </div>
      </div>
    );
  }

  // Burbuja normal
  return (
    <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        style={{
          maxWidth: "75%",
          padding: "8px 12px",
          borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isMe
            ? "linear-gradient(135deg, #c9a84c, #a8752e)"
            : theme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)",
          color: isMe
            ? "#fff"
            : theme === "dark" ? "rgba(255,255,255,0.85)" : "#1a1826",
          fontSize: "13px",
          lineHeight: "1.4",
          wordBreak: "break-word",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}