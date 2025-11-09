import React, { useEffect, useRef } from "react";
import { RoomGraph } from "@ashen/shared";
import { WorldMapView } from "./WorldMapView";

interface WorldMapDialogProps {
  roomGraph?: RoomGraph;
  currentRoomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WorldMapDialog: React.FC<WorldMapDialogProps> = ({
  roomGraph,
  currentRoomId,
  isOpen,
  onClose
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!roomGraph) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="world-map-dialog"
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className="world-map-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="world-map-dialog-header">
          <h2>World Map</h2>
          <button
            type="button"
            className="world-map-dialog-close"
            onClick={onClose}
            aria-label="Close map"
          >
            ×
          </button>
        </div>
        <div className="world-map-dialog-body">
          <WorldMapView roomGraph={roomGraph} currentRoomId={currentRoomId} />
        </div>
      </div>
    </dialog>
  );
};



