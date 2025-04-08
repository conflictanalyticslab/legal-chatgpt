import {
  Handle,
  useStore,
  useEdges,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { TextSearch, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { KeywordExtractorNode } from "../nodes";
import { cn } from "@/lib/utils";

export default function KeywordExtractorNode({
  id,
  data,
}: NodeProps<KeywordExtractorNode>) {
  const isConnectable = useStore((s) => s.nodesConnectable);
  const isSourceConnected = useEdges().some((edge) => edge.source === id);

  return (
    <CircularNode
      icon={<TextSearch className="size-8 text-neutral-700" />}
      label={data.label}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={!isConnectable ? "!cursor-default" : undefined}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "flex items-center justify-center text-[var(--text)]",
          isConnectable &&
            !isSourceConnected &&
            "group-hover:-mr-3 transition-[margin]",
          !isConnectable && "!cursor-default"
        )}
      >
        {isConnectable && !isSourceConnected && (
          <Plus className="size-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </Handle>
    </CircularNode>
  );
}
