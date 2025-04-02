import { useEffect } from "react";
import {
  useStoreApi,
  useStore,
  useReactFlow,
  type ReactFlowState,
} from "@xyflow/react";
import {
  Plus,
  Minus,
  Maximize,
  LockOpen,
  Lock,
  Undo,
  Redo,
} from "lucide-react";
import { shallow } from "zustand/shallow";

import { useDialogFlowStore } from "./store";
import { cn } from "@/lib/utils";

const selector = (s: ReactFlowState) => ({
  isInteractive: s.nodesDraggable || s.nodesConnectable,
  minZoomReached: s.transform[2] <= s.minZoom,
  maxZoomReached: s.transform[2] >= s.maxZoom,
});

export default function Controls() {
  const store = useStoreApi();
  const { isInteractive, minZoomReached, maxZoomReached } = useStore(
    selector,
    shallow
  );
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const temporal = useDialogFlowStore.temporal.getState();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            temporal.redo();
          } else {
            temporal.undo();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="absolute bottom-2.5 left-2.5 border border-neutral-200 rounded-sm flex flex-col overflow-hidden z-10 text-neutral-950">
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => zoomIn()}
        disabled={maxZoomReached}
      >
        <Plus className="size-4" />
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => zoomOut()}
        disabled={minZoomReached}
      >
        <Minus className="size-4" />
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5"
        onClick={() => fitView()}
      >
        <Maximize className="size-4" />
      </button>
      <button
        className={cn(
          "aspect-square p-1.5",
          isInteractive
            ? "hover:bg-neutral-100"
            : "bg-neutral-950 text-white hover:bg-neutral-900"
        )}
        onClick={() => {
          store.setState({
            nodesDraggable: !isInteractive,
            nodesConnectable: !isInteractive,
          });
        }}
      >
        {isInteractive ? (
          <LockOpen className="size-4" />
        ) : (
          <Lock className="size-4" />
        )}
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => temporal.undo()}
        disabled={!temporal.pastStates.length}
      >
        <Undo className="size-4" />
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => temporal.redo()}
        disabled={!temporal.futureStates.length}
      >
        <Redo className="size-4" />
      </button>
    </div>
  );
}
