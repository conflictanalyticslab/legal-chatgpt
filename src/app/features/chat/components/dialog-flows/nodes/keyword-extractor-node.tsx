import { Handle, NodeProps, Position } from "@xyflow/react";
import type { KeywordExtractorNode } from "../nodes";

export default function KeywordExtractorNode({
  data,
}: NodeProps<KeywordExtractorNode>) {
  return (
    <>
      🔍 {data.label}
      <Handle type="target" id="source" position={Position.Left} />
      <Handle type="source" id="result" position={Position.Right} />
    </>
  );
}
