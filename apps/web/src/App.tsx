import { useEffect, useMemo, useState } from "react";
import type { Command, GameState, ClientState } from "@ashen/shared";
import "./index.css";
import { useSession } from "./hooks/useSession";
import { useGameClient } from "./hooks/useGameClient";
import { MapView } from "./components/map/MapView";
import { ChatWindow } from "./components/chat/ChatWindow";
import { ChatMessage, PendingConfirm } from "./types/chat";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const welcomeMessage: ChatMessage = {
  id: makeId(),
  role: "system",
  content: "Ashen Vale awaits. Speak your intent and the wardens will heed you.",
  timestamp: Date.now()
};

const formatCommand = (command: Command): string => {
  return [command.verb, command.object, command.preposition, command.target]
    .filter(Boolean)
    .join(" ");
};

const extractFlavorEvents = (response: { events?: unknown[] }): string[] => {
  if (!Array.isArray(response.events)) return [];
  return response.events
    .filter(
      (event): event is { kind: string; payload?: { entry?: string } } =>
        Boolean(event) && typeof event === "object" && "kind" in (event as any)
    )
    .filter((event) => event.kind === "AppendLog")
    .map((event) => event.payload?.entry)
    .filter((entry): entry is string => Boolean(entry));
};

const buildMessage = (
  role: ChatMessage["role"],
  content: string,
  meta?: string
): ChatMessage => ({
  id: makeId(),
  role,
  content,
  meta,
  timestamp: Date.now()
});

const App = () => {
  const { sessionId, loading: sessionLoading, error: sessionError, resetSession } =
    useSession();
  const { stateQuery, commandMutation } = useGameClient(sessionId);

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [flavorEnabled, setFlavorEnabled] = useState(true);
  const state: GameState | undefined = stateQuery.data?.state;
  const client: ClientState | undefined = stateQuery.data?.client;
  const [statDelta, setStatDelta] = useState<{ power?: number; ward?: number; hp?: number } | null>(null);

  useEffect(() => {
    setMessages([welcomeMessage]);
    setPendingConfirm(null);
  }, [sessionId]);

  useEffect(() => {
    if (sessionError) {
      setMessages((prev) => [
        ...prev,
        buildMessage("system", `Session error: ${sessionError}`)
      ]);
    }
  }, [sessionError]);

  useEffect(() => {
    if (stateQuery.error) {
      setMessages((prev) => [
        ...prev,
        buildMessage(
          "system",
          `Could not refresh state: ${
            stateQuery.error instanceof Error ? stateQuery.error.message : "Unknown error"
          }`
        )
      ]);
    }
  }, [stateQuery.error]);

  const handleCommandSuccess = (inputText: string) => (response: any) => {
    if (response?.error) {
      setMessages((prev) => [...prev, buildMessage("system", response.error as string)]);
      return;
    }

    if (response?.needsConfirm && response.nlu) {
      const canonical = response.nlu.canonical as Command;
      setPendingConfirm({
        canonicalText: formatCommand(canonical),
        confidence: response.nlu.confidence ?? 0,
        command: canonical,
        rawText: response.nlu.rawText ?? inputText
      });
      setMessages((prev) => [
        ...prev,
        buildMessage(
          "system",
          `Did you mean: ${formatCommand(canonical)}?`,
          `Confidence ${(response.nlu.confidence * 100).toFixed(0)}%`
        )
      ]);
      return;
    }

    setPendingConfirm(null);

    if (response.resultText) {
      setMessages((prev) => [...prev, buildMessage("warden", response.resultText)]);
    }

    if (response.client && response.client.statDelta) {
      setStatDelta(response.client.statDelta);
      setTimeout(() => setStatDelta(null), 3000);
    }

    if (flavorEnabled) {
      const extras = extractFlavorEvents(response);
      if (extras.length > 0) {
        setMessages((prev) => [
          ...prev,
          ...extras.map((entry) => buildMessage("flavor", entry))
        ]);
      }
    }

    if (response.nlu && response.nlu.parser === "llm" && response.nlu.rawText) {
      setMessages((prev) => [
        ...prev,
        buildMessage(
          "system",
          `LLM interpreted input as ${formatCommand(response.nlu.canonical)}.`,
          `Confidence ${(response.nlu.confidence * 100).toFixed(0)}%`
        )
      ]);
    }
  };

  const handleCommandError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "The Night swallows the command. Try again.";
    setMessages((prev) => [...prev, buildMessage("system", message)]);
  };

  const handleSubmit = (text: string) => {
    if (!sessionId || pendingConfirm) {
      return;
    }
    setMessages((prev) => [...prev, buildMessage("player", text)]);
    commandMutation.mutate(
      { text },
      {
        onSuccess: handleCommandSuccess(text),
        onError: handleCommandError
      }
    );
  };

  const confirmCommand = () => {
    if (!pendingConfirm || !sessionId) return;
    setMessages((prev) => [
      ...prev,
      buildMessage("player", formatCommand(pendingConfirm.command))
    ]);
    commandMutation.mutate(
      { command: pendingConfirm.command, confirm: true },
      {
        onSuccess: handleCommandSuccess(pendingConfirm.rawText),
        onError: handleCommandError,
        onSettled: () => setPendingConfirm(null)
      }
    );
  };

  const cancelConfirm = () => {
    setPendingConfirm(null);
    setMessages((prev) => [
      ...prev,
      buildMessage("system", "Command cancelled. Adjust your words and try again.")
    ]);
  };

  const sidebar = useMemo(() => {
    if (!state) {
      return (
        <div className="sidebar-card">
          <h2>Status</h2>
          <p>Awaiting the bell’s toll…</p>
        </div>
      );
    }

    return (
      <>
        <div className="sidebar-card">
          <h2>Vitals</h2>
          <dl>
            <div>
              <dt>Health</dt>
              <dd>
                {client?.effectiveStats.hp ?? state.stats.hp}
                {statDelta?.hp ? (
                  <span className={statDelta.hp > 0 ? "delta-pos" : "delta-neg"}>
                    {statDelta.hp > 0 ? ` +${statDelta.hp}` : ` ${statDelta.hp}`}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>Power</dt>
              <dd>
                {client?.effectiveStats.power ?? state.stats.power}
                {statDelta?.power ? (
                  <span className={statDelta.power > 0 ? "delta-pos" : "delta-neg"}>
                    {statDelta.power > 0 ? ` +${statDelta.power}` : ` ${statDelta.power}`}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>Ward</dt>
              <dd>
                {client?.effectiveStats.ward ?? state.stats.ward}
                {statDelta?.ward ? (
                  <span className={statDelta.ward > 0 ? "delta-pos" : "delta-neg"}>
                    {statDelta.ward > 0 ? ` +${statDelta.ward}` : ` ${statDelta.ward}`}
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
        </div>
        <div className="sidebar-card">
          <h2>Location</h2>
          <p>{client?.locationName ?? state.roomId}</p>
          <MapView
            roomGraph={client?.roomGraph}
            currentRoomId={state.roomId}
            exits={client?.exits}
            onMove={(dir) => handleSubmit(`go ${dir}`)}
          />
          {client?.visibleActors && client.visibleActors.length > 0 ? (
            <div className="figures">
              <h3>Figures</h3>
              <ul>
                {client.visibleActors.map((a) => (
                  <li key={a.id}>
                    <span className={a.disposition === "friendly" ? "npc-friendly" : "npc-hostile"}>
                      {a.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="sidebar-card">
          <h2>Satchel</h2>
          {(client?.inventoryGroups?.length ?? 0) === 0 ? (
            <p className="muted">Satchel is empty.</p>
          ) : (
            <ul>
              {client?.inventoryGroups?.map((group) => {
                const key = `${group.name}`;
                return (
                  <li
                    key={key}
                    className="clickable"
                    title={
                      group.equipable
                        ? `Equip ${group.name}`
                        : `Use ${group.name}`
                    }
                    onClick={() =>
                      handleSubmit(
                        group.equipable ? `equip ${group.name}` : `use ${group.name}`
                      )
                    }
                  >
                    {group.name}
                    {group.quantity > 1 ? ` ×${group.quantity}` : ""}
                    {group.equipable ? " (equipable)" : ""}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="sidebar-card">
          <h2>Equipment</h2>
          <dl>
            {client?.equipment?.map((entry) => (
              <div key={entry.slot}>
                <dt>{entry.slot}</dt>
                <dd
                  className={entry.name ? "clickable" : undefined}
                  title={entry.name ? `Unequip ${entry.name}` : undefined}
                  onClick={
                    entry.name ? () => handleSubmit(`unequip ${entry.slot}`) : undefined
                  }
                >
                  {entry.name ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </>
    );
  }, [state, client, statDelta]);

  const toolbar = (
    <>
      <label className="toggle">
        <input
          type="checkbox"
          checked={flavorEnabled}
          onChange={(event) => setFlavorEnabled(event.target.checked)}
        />
        <span>Flavor log</span>
      </label>
      <button type="button" onClick={resetSession} className="ghost">
        Reset session
      </button>
    </>
  );

  if (sessionLoading || (sessionId && stateQuery.isLoading)) {
    return (
      <main className="app-shell">
        <div className="loading-state">Stoking embers…</div>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="app-shell">
        <div className="error-state">
          <p>{sessionError}</p>
          <button type="button" onClick={resetSession}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <ChatWindow
        title="Ashen Vale — Warden’s Line"
        messages={messages}
        pendingConfirm={pendingConfirm}
        onSubmit={handleSubmit}
        onQuickCommand={handleSubmit}
        onConfirm={confirmCommand}
        onCancelConfirm={cancelConfirm}
        submitting={commandMutation.isPending}
        extraToolbar={toolbar}
        inputDisabled={Boolean(state && state.stats.hp === 0)}
        exits={client?.exits}
        gameOver={Boolean(state && (state.stats.hp === 0 || state.flags["game:victory"]))}
        gameOverMessage={
          state && state.flags && state.flags["game:victory"]
            ? "The Great Bell is reforged. You win. Restart? (yes/no)"
            : undefined
        }
        onRestart={() => {
          setMessages((prev) => [...prev, buildMessage("system", "Restarting…")]);
          resetSession();
        }}
        onDeclineRestart={() => {
          setMessages((prev) => [
            ...prev,
            buildMessage(
              "system",
              "You remain fallen. Use the restart prompt or Reset session to begin anew."
            )
          ]);
        }}
      />
      <aside className="sidebar">{sidebar}</aside>
    </main>
  );
};

export default App;
