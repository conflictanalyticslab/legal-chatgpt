import { Handle, Position } from "@xyflow/react";
import { PlusCircle } from "lucide-react";

export default function GhostNode() {
  return (
    <div className="relative [--bg:var(--color-neutral-300)]">
      <div className="bg-white p-1 relative z-10 rounded-full">
        <div className="size-20 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer bg-neutral-50">
          <PlusCircle className="size-8 text-neutral-700" />
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
