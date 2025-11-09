import { ReactNode } from "react";
import { ChatMessage, PendingConfirm } from "../../types/chat";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { ConfirmBar } from "./ConfirmBar";
import { GameOverBar } from "./GameOverBar";

interface ChatWindowProps {
  title: ReactNode;
  messages: ChatMessage[];
  pendingConfirm: PendingConfirm | null;
  onSubmit: (text: string) => void;
  onConfirm: () => void;
  onCancelConfirm: () => void;
  submitting: boolean;
  extraToolbar?: ReactNode;
  inputDisabled?: boolean;
  gameOver?: boolean;
  onRestart?: () => void;
  onDeclineRestart?: () => void;
  gameOverMessage?: ReactNode;
  exits?: string[];
  onQuickCommand?: (text: string) => void;
}

export const ChatWindow = ({
  title,
  messages,
  pendingConfirm,
  onSubmit,
  onConfirm,
  onCancelConfirm,
  submitting,
  extraToolbar,
  inputDisabled,
  gameOver,
  onRestart,
  onDeclineRestart,
  gameOverMessage,
  exits,
  onQuickCommand
}: ChatWindowProps) => {
  const canUseQuickControls =
    !Boolean(inputDisabled) && !submitting && !Boolean(pendingConfirm) && !Boolean(gameOver);
  const dirLabel = (dir: string) => {
    const d = dir.toLowerCase();
    switch (d) {
      case "north":
        return "↑";
      case "south":
        return "↓";
      case "east":
        return "→";
      case "west":
        return "←";
      case "up":
        return "U";
      case "down":
        return "D";
      default:
        return d.slice(0, 1).toUpperCase();
    }
  };

  return (
    <section className="chat-window">
      <header className="chat-header">
        <h1>{title}</h1>
        {extraToolbar ? <div className="chat-toolbar">{extraToolbar}</div> : null}
      </header>

      <MessageList messages={messages} />

      {pendingConfirm ? (
        <ConfirmBar
          prompt={pendingConfirm}
          onConfirm={onConfirm}
          onCancel={onCancelConfirm}
        busy={submitting}
        />
      ) : null}

      {gameOver && onRestart && onDeclineRestart ? (
        <GameOverBar onRestart={onRestart} onDecline={onDeclineRestart} busy={submitting} message={gameOverMessage} />
      ) : null}

    <InputBar
      onSubmit={onSubmit}
      disabled={Boolean(inputDisabled) || submitting || Boolean(pendingConfirm)}
      rightControls={
        canUseQuickControls ? (
          <>
            {exits && exits.length > 0 ? (
              <div className="direction-inline" aria-label="Available exits">
                {exits.map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    className={`direction-btn dir-${dir.toLowerCase()}`}
                    title={`Go ${dir.toLowerCase()}`}
                    aria-label={`Go ${dir.toLowerCase()}`}
                    onClick={() => onQuickCommand?.(`go ${dir.toLowerCase()}`)}
                  >
                    {dirLabel(dir)}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              className="icon-btn attack-btn"
              title="Attack"
              aria-label="Attack"
              onClick={() => onQuickCommand?.("attack")}
            >
              <svg
                viewBox="0 0 24 24"
                width="1.25em"
                height="1.25em"
                aria-hidden="true"
                focusable="false"
                fill="currentColor"
              >
                {/* blade */}
                <polygon points="12,2 14,5 10,5" />
                <rect x="11" y="5" width="2" height="9" />
                {/* crossguard */}
                <rect x="8" y="14" width="8" height="2" />
                {/* handle */}
                <rect x="11" y="16" width="2" height="5" />
                {/* pommel */}
                <circle cx="12" cy="22" r="1" />
              </svg>
            </button>
          </>
        ) : null
      }
    />
    </section>
  );
};

