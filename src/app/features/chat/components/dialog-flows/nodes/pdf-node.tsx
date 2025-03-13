import { Handle, NodeProps, Position } from "@xyflow/react";
import type { PDFNode } from "../nodes";

export default function PDFNode({ data }: NodeProps<PDFNode>) {
  return (
    <>
      📁 {data.label}
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
