import { Handle, Position, type NodeProps } from "@xyflow/react";
import { PlusCircle } from "lucide-react";

import type { GhostNode } from "../nodes";

export default function GhostNode({ data }: NodeProps<GhostNode>) {
  return (
    <div className="relative [--bg:theme(colors.neutral.300)]">
      <div className="bg-white p-1 relative z-10 rounded-full">
        <div className="size-20 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer bg-neutral-50">
          <PlusCircle className="size-8 text-neutral-700" />
        </div>
      </div>
      {!data.standalone && <Handle type="target" position={Position.Left} />}
    </div>
  );
}
