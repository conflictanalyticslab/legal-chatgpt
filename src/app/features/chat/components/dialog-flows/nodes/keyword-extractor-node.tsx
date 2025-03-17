import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TextSearch, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { KeywordExtractorNode } from "../nodes";

export default function KeywordExtractorNode({
  data,
}: NodeProps<KeywordExtractorNode>) {
  return (
    <CircularNode
      icon={<TextSearch className="size-8 text-primary/70" />}
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
