import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";

interface InputBarProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  rightControls?: ReactNode;
}

export const InputBar = ({ onSubmit, disabled, rightControls }: InputBarProps) => {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    const trimmed = value.trim();
    onSubmit(trimmed);
    setHistory((prev) =>
      prev.length > 0 && prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]
    );
    setHistoryIndex(null);
    setDraft("");
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) {
        const nextIndex = history.length - 1;
        setDraft(value);
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      } else {
        const nextIndex = Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(null);
        setValue(draft);
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      }
    }
  };

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <form className="input-bar" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        disabled={disabled}
        value={value}
        onChange={(event) => {
          const text = event.target.value;
          setValue(text);
          if (historyIndex !== null) {
            setHistoryIndex(null);
            setDraft(text);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a command… e.g. “I swing my sword at the husk”"
        autoComplete="off"
      />
      <button type="submit" disabled={disabled || value.trim().length === 0}>
        Send
      </button>
      {rightControls ? <div className="quick-controls" aria-label="Quick actions">{rightControls}</div> : null}
    </form>
  );
};

