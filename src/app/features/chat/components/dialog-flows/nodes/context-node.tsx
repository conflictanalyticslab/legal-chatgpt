import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { ContextNode } from "../nodes";

export default function ContextNode({ data }: NodeProps<ContextNode>) {
  return (
    <>
      {data.label}

      <Handle type="target" position={Position.Top} />

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
