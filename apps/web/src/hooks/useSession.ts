import { useEffect, useState } from "react";
import { createSession } from "../lib/api";

const STORAGE_KEY = "ashen.sessionId";

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      setLoading(false);
      return;
    }

    let active = true;

    const bootstrap = async () => {
      try {
        const newSession = await createSession();
        if (!active) return;
        localStorage.setItem(STORAGE_KEY, newSession);
        setSessionId(newSession);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.error("[session] failed to create", err);
        setError(err instanceof Error ? err.message : "Failed to create session");
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const resetSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("[session] failed to clear storage", err);
    }
    setSessionId(null);
    setLoading(true);
    setError(null);
  };

  return { sessionId, loading, error, resetSession };
};

