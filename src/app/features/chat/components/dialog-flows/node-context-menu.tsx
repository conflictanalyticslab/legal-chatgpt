import { useEdges } from "@xyflow/react";
import {
  useFloating,
  useInteractions,
  useDismiss,
  offset,
  flip,
  shift,
} from "@floating-ui/react";

import type { GraphFlowNode } from "./nodes";
import { useDialogFlowStore, usePropertiesStore } from "./store";

type ContextMenuProps = {
  node: GraphFlowNode;
  position: { x: number; y: number };
  onReplace(): void;
  onClose: () => void;
};

export default function FlowContextMenu({
  node,
  position,
  onReplace,
  onClose,
}: ContextMenuProps) {
  const { refs, floatingStyles, context } = useFloating({
    open: !!position,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    middleware: [
      offset(5),
      flip({ fallbackAxisSideDirection: "end" }),
      shift(),
    ],
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  if (position && refs.reference.current === null) {
    const virtualEl = {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: position.x,
          y: position.y,
          top: position.y,
          left: position.x,
          right: position.x,
          bottom: position.y,
        };
      },
    };

    refs.setReference(virtualEl);
  }

  const { removeNode } = useDialogFlowStore();
  const { setSelectedItem } = usePropertiesStore();

  const isReplaceable = useIsReplaceable(node);

  const label = "label" in node.data ? node.data.label : "";

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className="z-[1000]"
    >
      <div className="bg-white rounded-md shadow-lg shadow-neutral-100 border border-neutral-200 w-64 overflow-hidden">
        {label && (
          <div className="flex flex-col gap-1 bg-neutral-50 p-2.5 pl-3 border-b border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-700">{label}</h3>
            <Description node={node} />
          </div>
        )}

        <div className="flex flex-col gap-1 p-1 text-neutral-700 text-sm">
          {node.type !== "ghost" && (
            <button
              className="w-full text-left px-3 py-2 hover:bg-neutral-100/75 rounded-md transition-colors"
              onClick={() => {
                setSelectedItem({ id: node.id, type: "node" });
                onClose();
              }}
            >
              Edit Node
            </button>
          )}

          {isReplaceable ? (
            <button
              className="w-full text-left px-3 py-2 hover:bg-neutral-100/75 rounded-md transition-colors"
              onClick={() => onReplace()}
            >
              Replace Node
            </button>
          ) : null}

          <button
            className="w-full text-left px-3 py-2 hover:bg-neutral-100/75 rounded-md transition-colors text-red-500"
            onClick={() => {
              removeNode(node.id);
              onClose();
            }}
          >
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
}

function Description({ node }: Pick<ContextMenuProps, "node">) {
  switch (node.type) {
    case "switch":
      return (
        <div className="flex flex-col gap-1 text-neutral-500 text-sm">
          {node.data.conditions.map((condition) => (
            <div key={condition.id} className="flex items-center gap-2">
              <div
                className="size-[18px] rounded-full border-2 border-white"
                style={{ backgroundColor: condition.color }}
              />
              <span>{condition.label}</span>
            </div>
          ))}

          {node.data.otherwise && (
            <div className="flex items-center gap-2">
              <div
                className="size-[18px] rounded-full border-2 border-white"
                style={{ backgroundColor: node.data.otherwise.color }}
              />
              <span>Otherwise</span>
            </div>
          )}
        </div>
      );
    case "relevant":
      return (
        <div className="flex flex-col gap-1 text-neutral-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-[#ecfccb] size-[18px] rounded-full border-2 border-white" />
            <span>Query</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#fef3c7] size-[18px] rounded-full border-2 border-white" />
            <span>Relevant</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#e0f2fe] size-[18px] rounded-full border-2 border-white" />
            <span>Subject</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#ffe4e6] size-[18px] rounded-full border-2 border-white" />
            <span>Not Relevant</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function useIsReplaceable(node: GraphFlowNode) {
  const isTargetConnected = useEdges().some((edge) => edge.target === node.id);
  const isSourceConnected = useEdges().some((edge) => edge.source === node.id);
  if (!isTargetConnected && !isSourceConnected) return true;

  switch (node.type) {
    case "example":
    case "instruction":
    case "context":
    case "keyword-extractor":
      return true;
    case "switch":
      if (isSourceConnected) return false;
      return true;
    case "pdf":
      return true;
    default:
      return false;
  }
}
