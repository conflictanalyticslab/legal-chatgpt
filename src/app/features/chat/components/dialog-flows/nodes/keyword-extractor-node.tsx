import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { TextSearch, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { KeywordExtractorNode } from "../nodes";
import { cn } from "@/lib/utils";

export default function KeywordExtractorNode({
  id,
  data,
}: NodeProps<KeywordExtractorNode>) {
  const isSourceConnected = useEdges().some((edge) => edge.source === id);

  return (
    <CircularNode
      icon={<TextSearch className="size-8 text-neutral-700" />}
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
