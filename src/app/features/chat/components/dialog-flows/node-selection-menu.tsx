import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useDialogFlowStore } from "./store";
import { createEmptyNode } from "./nodes";

// TODO: use floating ui

interface NodeSelectionMenuProps {
  ghostRef: HTMLElement | null;
  onClose(): void;
}

const NODE_TYPES = [
  { id: "example", label: "Example" },
  { id: "instruction", label: "Instruction" },
  { id: "context", label: "Context" },
  { id: "switch", label: "Switch" },
  { id: "relevant", label: "Relevant" },
  { id: "keyword-extractor", label: "Keyword Extractor" },
  { id: "ghost", label: "Ghost" },
] as const;

export default function NodeSelectionMenu({
  ghostRef,
  onClose,
}: NodeSelectionMenuProps) {
  const { nodes, addNode, removeNode, edges, setEdges } = useDialogFlowStore();

  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ghostRef) return;
    const rect = ghostRef.getBoundingClientRect();
    return setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, [ghostRef]);

  if (!ghostRef) return;

  return (
    <div
      className="fixed z-[100]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="bg-white rounded-md shadow-lg border border-neutral-200 w-64 overflow-hidden">
        <div className="flex justify-between items-center bg-neutral-50 p-2 pl-3 border-b border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-700">
            Select Node Type
          </h3>
          <button
            className="text-neutral-400 hover:text-neutral-500 p-1 rounded-md hover:bg-neutral-200/50 transition-colors"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-2 text-sm text-neutral-700">
          {NODE_TYPES.map((type) => (
            <button
              key={type.id}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100/75 rounded-md transition-colors"
              onClick={() => {
                const ghostId = ghostRef.dataset.id!;

                const ghost = nodes.find((n) => n.id === ghostId);
                if (!ghost) return;

                const source = edges.find((edge) => edge.target === ghostId);
                if (!source) return;

                removeNode(ghostId);

                const node = createEmptyNode(type.id, ghost.position);
                addNode(node);

                const a = edges.map((edge) => {
                  if (edge.target !== ghostId) return edge;
                  return {
                    ...edge,
                    target: node.id,
                    targetHandle: type.id === "relevant" ? "query" : null,
                  };
                });
                console.log(a.find((edge) => edge.target === node.id));

                setEdges(a);

                onClose();
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
