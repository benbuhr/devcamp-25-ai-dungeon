import React, { useMemo } from "react";
import { RoomGraph, Room } from "@ashen/shared";

interface WorldMapViewProps {
  roomGraph: RoomGraph;
  currentRoomId: string;
}

interface RoomNode {
  id: string;
  room: Room;
  x: number;
  y: number;
  level: number; // For vertical positioning (up/down)
}

// Layout algorithm: uses BFS from hub with integer grid coordinates
// Ensures proper spacing and no overlaps
const layoutRooms = (roomGraph: RoomGraph, currentRoomId: string): RoomNode[] => {
  const rooms = Object.values(roomGraph.rooms);
  const nodes: RoomNode[] = [];
  const visited = new Set<string>();
  const positionMap = new Map<string, { x: number; y: number; level: number }>();
  const gridSpacing = 3; // Minimum distance between rooms on the same level
  
  // Track occupied grid positions to prevent overlaps
  const occupiedGrid = new Map<string, string>(); // key: "x,y,level" -> roomId
  
  const getGridKey = (x: number, y: number, level: number): string => {
    return `${Math.round(x)},${Math.round(y)},${level}`;
  };
  
  const isPositionOccupied = (x: number, y: number, level: number, excludeId?: string): boolean => {
    const key = getGridKey(x, y, level);
    const occupiedBy = occupiedGrid.get(key);
    return occupiedBy !== undefined && occupiedBy !== excludeId;
  };
  
  const occupyPosition = (x: number, y: number, level: number, roomId: string): void => {
    const key = getGridKey(x, y, level);
    occupiedGrid.set(key, roomId);
  };
  
const findFreePosition = (
  originX: number,
  originY: number,
  level: number,
  direction: { dx: number; dy: number },
  radius: number = 8
): { x: number; y: number } => {
  // Determine unit step aligned with the direction (axis-aligned)
  const stepX = direction.dx === 0 ? 0 : Math.sign(direction.dx) * gridSpacing;
  const stepY = direction.dy === 0 ? 0 : Math.sign(direction.dy) * gridSpacing;

  // Helper to check a candidate position
  const tryPosition = (x: number, y: number) => {
    if (!isPositionOccupied(x, y, level)) {
      return { x, y };
    }
    return null;
  };

  // First preference: one step in the intended direction
  const initialX = originX + stepX;
  const initialY = originY + stepY;
  const initial = tryPosition(initialX, initialY);
  if (initial) {
    return initial;
  }

  // Extend further along the same axis to avoid collisions
  for (let distance = 2; distance <= radius; distance++) {
    const testX = originX + stepX * distance;
    const testY = originY + stepY * distance;
    const candidate = tryPosition(testX, testY);
    if (candidate) {
      return candidate;
    }
  }

  // As a final fallback, return the first step even if occupied (will overlap but avoids undefined)
  return { x: initialX, y: initialY };
};
  
  // Find hub (graysong-square) or use first room
  const hubId = "graysong-square";
  const hub = roomGraph.rooms[hubId] || rooms[0];
  if (!hub) return [];
  
  const startId = hub.id;
  const startPos = { x: 0, y: 0, level: 0 };
  positionMap.set(startId, startPos);
  occupyPosition(startPos.x, startPos.y, startPos.level, startId);
  visited.add(startId);
  
  // Direction offsets - using integer grid spacing
  const dirOffsets: Record<string, { dx: number; dy: number; dl: number }> = {
    north: { dx: 0, dy: -gridSpacing, dl: 0 },
    south: { dx: 0, dy: gridSpacing, dl: 0 },
    east: { dx: gridSpacing, dy: 0, dl: 0 },
    west: { dx: -gridSpacing, dy: 0, dl: 0 },
    up: { dx: 0, dy: 0, dl: -1 },
    down: { dx: 0, dy: 0, dl: 1 }
  };
  
  // BFS to assign positions
  const queue: Array<{ id: string; x: number; y: number; level: number }> = [
    { id: startId, ...startPos }
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const room = roomGraph.rooms[current.id];
    if (!room) continue;
    
    // Process exits
    const exitEntries = Object.entries(room.exits);
    for (const [dir, targetId] of exitEntries) {
      if (visited.has(targetId)) {
        // Already positioned, skip (handles cycles)
        continue;
      }
      
      const offset = dirOffsets[dir.toLowerCase()] || { dx: 0, dy: 0, dl: 0 };
      const newLevel = current.level + offset.dl;
      
      // For vertical connections (up/down), keep same x,y but different level
      // For horizontal connections, find free position on the grid
      let finalPos: { x: number; y: number; level: number };
      
      if (offset.dl !== 0) {
        // Vertical connection - keep same grid position, different level
        finalPos = { x: current.x, y: current.y, level: newLevel };
      } else {
        // Horizontal connection - find free grid position
        const freePos = findFreePosition(current.x, current.y, newLevel, offset);
        finalPos = { x: freePos.x, y: freePos.y, level: newLevel };
      }
      
      // Occupy the position
      occupyPosition(finalPos.x, finalPos.y, finalPos.level, targetId);
      positionMap.set(targetId, finalPos);
      visited.add(targetId);
      queue.push({ id: targetId, ...finalPos });
    }
  }
  
  // Add any unvisited rooms (disconnected rooms)
  for (const room of rooms) {
    if (!visited.has(room.id)) {
      // Place disconnected rooms far away
      let farX = 20;
      let farY = 20;
      let attempts = 0;
      while (isPositionOccupied(farX, farY, 0) && attempts < 100) {
        farX += gridSpacing;
        if (attempts % 10 === 0) {
          farY += gridSpacing;
          farX = 20;
        }
        attempts++;
      }
      const disconnectedPos = { x: farX, y: farY, level: 0 };
      occupyPosition(disconnectedPos.x, disconnectedPos.y, disconnectedPos.level, room.id);
      positionMap.set(room.id, disconnectedPos);
    }
  }
  
  // Convert to nodes
  for (const room of rooms) {
    const pos = positionMap.get(room.id);
    if (pos) {
      nodes.push({
        id: room.id,
        room,
        x: pos.x,
        y: pos.y,
        level: pos.level
      });
    }
  }
  
  return nodes;
};

export const WorldMapView: React.FC<WorldMapViewProps> = ({ roomGraph, currentRoomId }) => {
  const allNodes = useMemo(() => layoutRooms(roomGraph, currentRoomId), [roomGraph, currentRoomId]);
  
  // Find the current room's level
  const currentRoomNode = allNodes.find(n => n.id === currentRoomId);
  const currentLevel = currentRoomNode?.level ?? 0;
  
  // Filter nodes to only show rooms at the user's current level
  const nodes = useMemo(() => {
    return allNodes.filter(node => node.level === currentLevel);
  }, [allNodes, currentLevel]);
  
  // Calculate bounds for centering (only for visible nodes)
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }, [nodes]);
  
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  
  // Scale factor for visualization - adjust based on map size
  // With grid spacing of 3, we need to scale appropriately
  const baseScale = 50; // Reduced since rooms are now farther apart on grid
  const scale = Math.max(30, Math.min(baseScale, 600 / Math.max(width, height)));
  const padding = 1;
  const offsetX = -bounds.minX + padding;
  const offsetY = -bounds.minY + padding;
  
  // Collect connections - only show horizontal connections (same level)
  // Skip vertical connections (up/down) since we're only showing one level
  const connections = useMemo(() => {
    const conns: Array<{ from: RoomNode; to: RoomNode; dir: string }> = [];
    for (const node of nodes) {
      for (const [dir, targetId] of Object.entries(node.room.exits)) {
        // Skip vertical connections (up/down) - only show horizontal connections
        const isVertical = dir.toLowerCase() === "up" || dir.toLowerCase() === "down";
        if (isVertical) {
          continue;
        }
        
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode && targetNode.level === currentLevel) {
          // Only add connection if both rooms are at the same level
          conns.push({ from: node, to: targetNode, dir });
        }
      }
    }
    return conns;
  }, [nodes, currentLevel]);
  
  // Calculate the actual bounding box of transformed coordinates
  if (nodes.length === 0) {
    return (
      <div className="world-map-view">
        <p className="muted">No rooms to display.</p>
      </div>
    );
  }
  
  const transformedCoords = nodes.map(node => ({
    x: (node.x + offsetX) * scale,
    y: (node.y + offsetY) * scale
  }));
  
  const transBounds = {
    minX: Math.min(...transformedCoords.map(c => c.x)),
    maxX: Math.max(...transformedCoords.map(c => c.x)),
    minY: Math.min(...transformedCoords.map(c => c.y)),
    maxY: Math.max(...transformedCoords.map(c => c.y))
  };
  
  const roomSize = 36; // Room box size
  const margin = 80;
  const viewBoxX = transBounds.minX - roomSize / 2 - margin;
  const viewBoxY = transBounds.minY - roomSize / 2 - margin;
  const viewBoxWidth = (transBounds.maxX - transBounds.minX) + roomSize + margin * 2;
  const viewBoxHeight = (transBounds.maxY - transBounds.minY) + roomSize + margin * 2;
  
  return (
    <div className="world-map-view">
      <svg
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        className="world-map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Draw connections - only horizontal connections at current level */}
        <g className="connections">
          {connections.map((conn, idx) => {
            const x1 = (conn.from.x + offsetX) * scale;
            const y1 = (conn.from.y + offsetY) * scale;
            const x2 = (conn.to.x + offsetX) * scale;
            const y2 = (conn.to.y + offsetY) * scale;
            
            // All connections shown are at the same level (horizontal only)
            return (
              <line
                key={`${conn.from.id}-${conn.to.id}-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(148, 163, 184, 0.25)"
                strokeWidth="1.5"
              />
            );
          })}
        </g>
        
        {/* Draw rooms */}
        <g className="rooms">
          {nodes.map((node) => {
            const x = (node.x + offsetX) * scale;
            const y = (node.y + offsetY) * scale;
            const isCurrent = node.id === currentRoomId;
            
            return (
              <g key={node.id} className={`room-node ${isCurrent ? "current" : ""}`}>
                <rect
                  x={x - 18}
                  y={y - 18}
                  width="36"
                  height="36"
                  rx="6"
                  className={isCurrent ? "room-box current-room" : "room-box"}
                  fill={isCurrent ? "rgba(249, 115, 22, 0.5)" : "rgba(255, 255, 255, 0.1)"}
                  stroke={isCurrent ? "rgba(249, 115, 22, 1)" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth={isCurrent ? "2.5" : "1.5"}
                />
                {isCurrent && (
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="rgba(249, 115, 22, 1)"
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

