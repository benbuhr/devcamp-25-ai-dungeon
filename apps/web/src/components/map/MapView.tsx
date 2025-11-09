import React from "react";
import { RoomGraph } from "@ashen/shared";

interface MapViewProps {
  roomGraph?: RoomGraph;
  currentRoomId: string;
  exits?: string[];
  onMove: (direction: "north" | "south" | "east" | "west" | "up" | "down") => void;
}

const dirOrder = ["north", "west", "east", "south"] as const;
type Cardinal = typeof dirOrder[number];

export const MapView: React.FC<MapViewProps> = ({ roomGraph, currentRoomId, exits, onMove }) => {
  if (!roomGraph || !roomGraph.rooms[currentRoomId]) {
    return null;
  }

  const current = roomGraph.rooms[currentRoomId];
  const currentExits = new Set<string>(exits ?? Object.keys(current.exits ?? {}));
  const hasUp = currentExits.has("up");
  const hasDown = currentExits.has("down");

  const neighborFor = (dir: Cardinal): { id?: string; name?: string } => {
    const id = current.exits?.[dir];
    if (!id) return {};
    const r = roomGraph.rooms[id];
    return r ? { id: r.id, name: r.name } : {};
  };

  const cells: Array<{
    key: string;
    label: string;
    title?: string;
    kind: "empty" | "current" | "adjacent" | "blocked";
    dir?: Cardinal;
  }> = [
    {
      key: "north",
      label: "N",
      title: neighborFor("north").name,
      kind: currentExits.has("north") ? "adjacent" : "blocked",
      dir: "north"
    },
    {
      key: "west",
      label: "W",
      title: neighborFor("west").name,
      kind: currentExits.has("west") ? "adjacent" : "blocked",
      dir: "west"
    },
    { key: "center", label: "", title: current.name, kind: "current" },
    {
      key: "east",
      label: "E",
      title: neighborFor("east").name,
      kind: currentExits.has("east") ? "adjacent" : "blocked",
      dir: "east"
    },
    {
      key: "south",
      label: "S",
      title: neighborFor("south").name,
      kind: currentExits.has("south") ? "adjacent" : "blocked",
      dir: "south"
    }
  ];

  return (
    <div className="map-view" aria-label="Map">
      <div className="map-wrap">
        <div className="map-grid" role="group" aria-label="Nearby rooms">
          {/* Row 1: North */}
          <div className="map-row">
            <MapCell cell={cells[0]} onMove={onMove} />
          </div>
          {/* Row 2: West, Current, East */}
          <div className="map-row middle">
            <MapCell cell={cells[1]} onMove={onMove} />
            <MapCell cell={cells[2]} onMove={onMove} />
            <MapCell cell={cells[3]} onMove={onMove} />
          </div>
          {/* Row 3: South */}
          <div className="map-row">
            <MapCell cell={cells[4]} onMove={onMove} />
          </div>
        </div>
        <div className="map-ud" aria-label="Vertical exits">
          {hasUp ? (
            <button
              type="button"
              className="map-node adjacent dir-up"
              title="Up"
              aria-label="Go up"
              onClick={() => onMove("up")}
            >
              U
            </button>
          ) : (
            <div className="map-node blocked dir-up" aria-hidden="true">U</div>
          )}
          {hasDown ? (
            <button
              type="button"
              className="map-node adjacent dir-down"
              title="Down"
              aria-label="Go down"
              onClick={() => onMove("down")}
            >
              D
            </button>
          ) : (
            <div className="map-node blocked dir-down" aria-hidden="true">D</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CellProps {
  cell: {
    key: string;
    label: string;
    title?: string;
    kind: "empty" | "current" | "adjacent" | "blocked";
    dir?: Cardinal;
  };
  onMove: (direction: Cardinal) => void;
}

const MapCell: React.FC<CellProps> = ({ cell, onMove }) => {
  const className = `map-node ${cell.kind}${cell.dir ? ` dir-${cell.dir}` : ""}`;
  if (cell.kind === "adjacent" && cell.dir) {
    return (
      <button
        type="button"
        className={className}
        title={cell.title ?? undefined}
        aria-label={`Go ${cell.dir}${cell.title ? ` to ${cell.title}` : ""}`}
        onClick={() => onMove(cell.dir!)}
      >
        {cell.label}
      </button>
    );
  }
  return (
    <div
      className={className}
      title={cell.kind === "current" ? cell.title : cell.title ?? undefined}
      aria-label={
        cell.kind === "current"
          ? `Current location: ${cell.title ?? "Unknown"}`
          : cell.title
          ? `Blocked: ${cell.title}`
          : cell.kind === "blocked"
          ? "Blocked"
          : "Empty"
      }
    >
      {cell.kind === "current" ? (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="5" />
        </svg>
      ) : null}
    </div>
  );
};

export default MapView;


