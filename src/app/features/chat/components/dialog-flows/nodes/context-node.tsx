import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { Brain, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { ContextNode } from "../nodes";
import { cn } from "@/lib/utils";

export default function ContextNode({ id, data }: NodeProps<ContextNode>) {
  const isSourceConnected = useEdges().some((edge) => edge.source === id);

  return (
    <CircularNode
      icon={<Brain className="size-8 text-neutral-700" />}
      label={data.label}
    >
      <Handle type="target" position={Position.Left} />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "flex items-center justify-center text-[var(--text)]",
          !isSourceConnected && "group-hover:-mr-3 transition-[margin]"
        )}
      >
        {!isSourceConnected && (
          <Plus className="size-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </Handle>
    </CircularNode>
  );
}
