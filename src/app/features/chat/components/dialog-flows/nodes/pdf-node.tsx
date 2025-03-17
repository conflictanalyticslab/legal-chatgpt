import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileText, Plus } from "lucide-react";

import CircularNode from "./circular-node";

import type { PDFNode } from "../nodes";

export default function PDFNode({ data }: NodeProps<PDFNode>) {
  return (
    <CircularNode
      icon={<FileText className="size-8 text-primary/70" />}
      label={data.label}
    >
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
