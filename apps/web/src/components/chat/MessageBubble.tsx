import { ChatMessage } from "../../types/chat";

const roleStyles: Record<ChatMessage["role"], string> = {
  player: "bg-ember text-foreground border border-ember-accent self-end",
  warden: "bg-panel border border-panel-border self-start",
  system: "bg-system text-system-foreground self-center text-xs uppercase tracking-wide",
  flavor: "bg-flavor text-flavor-foreground border border-flavor-outline self-start italic"
};

const roleLabels: Record<ChatMessage["role"], string> = {
  player: "You",
  warden: "Warden",
  system: "System",
  flavor: "Flavor"
};

export const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const label = roleLabels[message.role];
  const className = roleStyles[message.role];

  return (
    <article className={`message-bubble ${className}`}>
      <header className="message-header">
        <span>{label}</span>
        <span className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      </header>
      <p>{message.content}</p>
      {message.meta ? <footer className="message-meta">{message.meta}</footer> : null}
    </article>
  );
};

