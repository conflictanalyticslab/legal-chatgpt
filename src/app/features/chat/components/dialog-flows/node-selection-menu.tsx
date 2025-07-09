import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useEdges } from "@xyflow/react";
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
import {
  createEmptyNode,
  GhostNode,
  GraphFlowNode,
  GraphFlowNodeTypes,
  PrecedentTypes
} from "./nodes";

export type NodeSelectionMenuHandle = {
  open(type: "add" | "replace", node: Pick<GraphFlowNode, "id" | "type">): void;
};

type NodeSelectionProps = {
  onReplace(): void;
};

const NODE_TYPES = [
  { id: "example", label: "Example" },
  { id: "instruction", label: "Instruction" },
  { id: "context", label: "Context" },
  { id: "switch", label: "Switch" },
  { id: "relevant", label: "Relevant" },
  { id: "keyword-extractor", label: "Keyword Extractor" },
  { id: "extractor", label: "Extractor" },
] as { id: GraphFlowNodeTypes; label: string }[];

export default forwardRef<NodeSelectionMenuHandle, NodeSelectionProps>(
  function NodeSelectionMenu({ onReplace }, ref) {
    const arrowRef = useRef<SVGSVGElement>(null);

    const { nodes, updateNode, addNode, removeNode, edges, setEdges } =
      useDialogFlowStore();

    const [data, setData] = useState<{
      el: HTMLElement;
      type: "add" | "replace";
      node: Pick<GraphFlowNode, "id" | "type">;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      open(type, node) {
        // prettier-ignore
        const el = document.querySelector(`.react-flow__node[data-id="${node.id}"]`)
        if (!el) return;

        setData({ el: el as HTMLElement, type, node });
      },
    }));

    const { refs, floatingStyles, context } = useFloating({
      open: data ? !!data.el : false,
      onOpenChange: (open) => {
        if (!open) setData(null);
      },
      middleware: [
        offset(-1),
        flip({ fallbackAxisSideDirection: "end" }),
        shift(),
        arrow({ element: arrowRef }),
      ],
      whileElementsMounted: autoUpdate,
      elements: {
        reference: data ? data.el : null,
      },
    });

    const click = useClick(context);
    const role = useRole(context);
    const { getFloatingProps } = useInteractions([click, role]);

    const getReplacementNodeTypes = useGetReplacementNodeTypes();

    if (!data) return;

    let types = NODE_TYPES;
    if (data.type === "replace") {
      const allowTypes = getReplacementNodeTypes(data.node);
      types = types.filter((type) => allowTypes.includes(type.id));
      if (allowTypes.includes("pdf")) types.push({ id: "pdf", label: "PDF" });
    }

    return (
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
      >
        <div className="bg-white rounded-md shadow-lg shadow-neutral-100 border border-neutral-200 w-64 overflow-hidden">
          <div className="flex justify-between items-center bg-neutral-50 p-2.5 pl-3 border-b border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-700">
              Select Node Type
            </h3>
            <button
              className="text-neutral-400 hover:text-neutral-500 p-1 rounded-md hover:bg-neutral-200/50 transition-colors"
              onClick={() => setData(null)}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1 p-1 text-sm text-neutral-700">
            {types.map((type) => (
              <button
                key={type.id}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100/75 rounded-md transition-colors"
                onClick={() => {
                  const node = nodes.find((node) => node.id === data.node.id);
                  if (!node) return;

                  const newNode = createEmptyNode(type.id, node.position);

                  switch (data.type) {
                    case "add":
                      if (node.type !== "ghost") return;

                      const source = edges.find(
                        (edge) => edge.target === node.id
                      );
                      if (!source && !node.data.standalone) return;

                      removeNode(node.id);
                      addNode(newNode);

                      if (!node.data.standalone) {
                        setEdges(
                          edges.map((edge) => {
                            if (edge.target !== node.id) return edge;
                            return {
                              ...edge,
                              target: newNode.id,
                              targetHandle:
                                type.id === "relevant" ? "query" : null,
                            };
                          })
                        );
                      }
                    case "replace":
                      const complete = ["example", "instruction", "context"];
                      if (
                        complete.includes(node.type!) &&
                        complete.includes(type.id)
                      ) {
                        updateNode(node.id, (prev) => {
                          return {
                            ...prev,
                            type: type.id,
                            data: {
                              ...node.data,
                              label: getCustomOrOriginalLabel(node, newNode),
                            },
                          } as GraphFlowNode;
                        });
                      } else {
                        updateNode(node.id, (prev) => {
                          return {
                            ...prev,
                            type: type.id,
                            data: {
                              ...newNode.data,
                              label: getCustomOrOriginalLabel(node, newNode),
                            },
                          } as GraphFlowNode;
                        });
                      }
                      onReplace();
                  }

                  setData(null);
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
);

function useGetReplacementNodeTypes() {
  const edges = useEdges();

  return (node: Pick<GraphFlowNode, "id" | "type">) => {
    const isTargetConnected = edges.some((edge) => edge.target === node.id);
    const isSourceConnected = edges.some((edge) => edge.source === node.id);

    const types = [
      "example",
      "instruction",
      "context",
      "switch",
      "extractor",
      "keyword-extractor"
    ].filter((type) => type !== node.type);
    if (!isTargetConnected && !isSourceConnected) {
      return [...types, "pdf", "relevant"];
    }

    switch (node.type) {
      case "example":
      case "instruction":
      case "context":
      case "extractor":
        if (!isTargetConnected) types.push("pdf");
        return types.filter((type) => {
          if (isSourceConnected && type === "switch") return false;
          return true;
        });      
      case "keyword-extractor":
        if (!isTargetConnected) types.push("pdf");
        return types.filter((type) => {
          if (isSourceConnected && type === "switch") return false;
          return true;
        });
      case "switch":
        if (isSourceConnected) return [];
        return types;
      case "pdf":
        return types.filter((type) => {
          if (isSourceConnected && type === "switch") return false;
          return true;
        });
      default:
        return [];
    }
  };
}

function getCustomOrOriginalLabel(a: GraphFlowNode, b: GraphFlowNode) {
  type Node = Exclude<GraphFlowNode, GhostNode>;
  const original = createEmptyNode(a.type!, a.position) as Node;
  return (a as Node).data.label === original.data.label
    ? (b as Node).data.label
    : (a as Node).data.label;
}
