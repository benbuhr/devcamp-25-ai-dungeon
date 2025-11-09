import { PendingConfirm } from "../../types/chat";

interface ConfirmBarProps {
  prompt: PendingConfirm;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

export const ConfirmBar = ({ prompt, onConfirm, onCancel, busy }: ConfirmBarProps) => {
  return (
    <div className="confirm-bar" role="alert">
      <div>
        <p>
          Execute <code>{prompt.canonicalText}</code>? (confidence{" "}
          {(prompt.confidence * 100).toFixed(0)}%)
        </p>
        <small>Input: “{prompt.rawText}”</small>
      </div>
      <div className="confirm-actions">
        <button type="button" onClick={onConfirm} disabled={busy}>
          Confirm
        </button>
        <button type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
};

