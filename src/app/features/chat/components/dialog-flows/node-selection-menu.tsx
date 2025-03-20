import { useRef } from "react";
import {
  FloatingArrow,
  useFloating,
  useClick,
  useRole,
  useInteractions,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
} from "@floating-ui/react";
import { X } from "lucide-react";

import { useDialogFlowStore } from "./store";
import { createEmptyNode, GhostNode } from "./nodes";

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
] as const;

export default function NodeSelectionMenu({
  ghostRef,
  onClose,
}: NodeSelectionMenuProps) {
  const arrowRef = useRef<SVGSVGElement>(null);

  const { nodes, addNode, removeNode, edges, setEdges } = useDialogFlowStore();

  const { refs, floatingStyles, context } = useFloating({
    open: !!ghostRef,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    middleware: [
      offset(-1),
      flip({ fallbackAxisSideDirection: "end" }),
      shift(),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: ghostRef,
    },
  });

  const click = useClick(context);
  const role = useRole(context);
  const { getFloatingProps } = useInteractions([click, role]);

  if (!ghostRef) return;

  return (
    <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
      <div className="bg-white rounded-md shadow-lg shadow-neutral-100 border border-neutral-200 w-64 overflow-hidden">
        <div className="flex justify-between items-center bg-neutral-50 p-2.5 pl-3 border-b border-neutral-200">
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

        <div className="flex flex-col gap-1 p-1 text-sm text-neutral-700">
          {NODE_TYPES.map((type) => (
            <button
              key={type.id}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100/75 rounded-md transition-colors"
              onClick={() => {
                const ghostId = ghostRef.dataset.id!;

                const ghost = nodes.find((n) => {
                  return node.id === ghostId && node.type === "ghost";
                }) as GhostNode | undefined;
                if (!ghost) return;

                const source = edges.find((edge) => edge.target === ghostId);
                if (!source && !ghost.data.standalone) return;

                removeNode(ghostId);

                const node = createEmptyNode(type.id, ghost.position);
                addNode(node);

                if (!ghost.data.standalone) {
                  setEdges(
                    edges.map((edge) => {
                      if (edge.target !== ghostId) return edge;
                      return {
                        ...edge,
                        target: node.id,
                        targetHandle: type.id === "relevant" ? "query" : null,
                      };
                    })
                  );
                }

                onClose();
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <FloatingArrow
        ref={arrowRef}
        context={context}
        tipRadius={1}
        strokeWidth={1}
        className="fill-neutral-50 [&>path:first-of-type]:stroke-neutral-200 [&>path:last-of-type]:stroke-neutral-50"
        style={{ transform: "translateY(-1px)" }}
      />
    </div>
  );
}
