import { ReactNode } from "react";

interface GameOverBarProps {
  onRestart: () => void;
  onDecline: () => void;
  busy?: boolean;
  message?: ReactNode;
}

export const GameOverBar = ({
  onRestart,
  onDecline,
  busy,
  message
}: GameOverBarProps) => {
  return (
    <div className="confirm-bar" role="alert">
      <div>
        <p>{message ?? "Game over. Would you like to restart? (yes/no)"}</p>
      </div>
      <div className="confirm-actions">
        <button type="button" onClick={onRestart} disabled={busy}>
          Yes, restart
        </button>
        <button type="button" onClick={onDecline} disabled={busy}>
          No
        </button>
      </div>
    </div>
  );
};



