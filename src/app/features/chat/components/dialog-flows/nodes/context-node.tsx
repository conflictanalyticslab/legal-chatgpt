import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Brain, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { ContextNode } from "../nodes";

export default function ContextNode({ data }: NodeProps<ContextNode>) {
  return (
    <CircularNode
      icon={<Brain className="size-8 text-primary/70" />}
      label={data.label}
    >
      <Handle type="target" position={Position.Left} />
      <Handle
        type="source"
        position={Position.Right}
        className="group-hover:-mr-3 flex items-center justify-center text-[var(--text)] transition-[margin]"
      >
        <Plus className="size-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Handle>
    </CircularNode>
  );
}
