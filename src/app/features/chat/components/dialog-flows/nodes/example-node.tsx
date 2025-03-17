import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { StickyNote, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { ExampleNode } from "../nodes";

export default function ExampleNode({ data }: NodeProps<ExampleNode>) {
  return (
    <CircularNode
      icon={<StickyNote className="size-8 text-primary/70" />}
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
