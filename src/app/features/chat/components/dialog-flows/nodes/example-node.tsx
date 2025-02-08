import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

import type { ExampleNode } from "../nodes";

export default function ExampleNode({ data }: NodeProps<ExampleNode>) {
  return (
    <>
      {data.label}

      <Handle type="target" position={Position.Top} />

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
