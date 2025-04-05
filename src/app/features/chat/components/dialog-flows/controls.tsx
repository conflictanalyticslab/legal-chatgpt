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

export default function Controls() {
  const controls = useControls();
  const { origin } = useDialogFlowStore();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            controls.redo();
          } else {
            controls.undo();
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
        onClick={() => controls.zoomIn()}
        disabled={controls.maxZoomReached}
      >
        <Plus className="size-4" />
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => controls.zoomOut()}
        disabled={controls.minZoomReached}
      >
        <Minus className="size-4" />
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5"
        onClick={() => controls.fitView()}
      >
        <Maximize className="size-4" />
      </button>
      {origin !== "universal" && (
        <button
          className={cn(
            "aspect-square p-1.5",
            controls.isInteractive
              ? "hover:bg-neutral-100"
              : "bg-neutral-950 text-white hover:bg-neutral-900"
          )}
          onClick={() => {
            if (controls.isInteractive) {
              controls.lock();
            } else {
              controls.unlock();
            }
          }}
        >
          {controls.isInteractive ? (
            <LockOpen className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
        </button>
      )}
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => controls.undo()}
        disabled={!controls.isUndoable}
      >
        <Undo className="size-4" />
      </button>
      <button
        className="hover:bg-neutral-100 aspect-square p-1.5 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        onClick={() => controls.redo()}
        disabled={!controls.isRedoable}
      >
        <Redo className="size-4" />
      </button>
    </div>
  );
}

const selector = (s: ReactFlowState) => ({
  isInteractive: s.nodesDraggable || s.nodesConnectable,
  minZoomReached: s.transform[2] <= s.minZoom,
  maxZoomReached: s.transform[2] >= s.maxZoom,
});

export function useControls() {
  const store = useStoreApi();
  const { isInteractive, minZoomReached, maxZoomReached } = useStore(
    selector,
    shallow
  );
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const temporal = useDialogFlowStore.temporal.getState();

  return {
    isInteractive,
    lock() {
      store.setState({
        nodesDraggable: false,
        nodesConnectable: false,
      });
    },
    unlock() {
      store.setState({
        nodesDraggable: true,
        nodesConnectable: true,
      });
    },

    fitView,

    maxZoomReached,
    zoomIn,

    minZoomReached,
    zoomOut,

    isUndoable: !!temporal.pastStates.length,
    undo: temporal.undo,

    isRedoable: !!temporal.futureStates.length,
    redo: temporal.redo,
  };
}
