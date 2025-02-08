import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { InstructionNode } from "../nodes";

export default function InstructionNode({ data }: NodeProps<InstructionNode>) {
  return (
    <>
      {data.label}

      <Handle type="target" position={Position.Top} />

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
