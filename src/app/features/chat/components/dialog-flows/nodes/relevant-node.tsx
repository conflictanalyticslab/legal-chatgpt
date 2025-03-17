import { Handle as BaseHandle, Position, type NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";

import CircularNode, { RADIUS } from "./circular-node";

import type { RelevantNode } from "../nodes";
import { angleToCoordinates, calculateHandleAngles } from "./helpers";

export default function RelevantNode({ data }: NodeProps<RelevantNode>) {
  const targetAngles = calculateHandleAngles(2, 180);
  const sourceAngles = calculateHandleAngles(2, 0);

  return (
    <CircularNode icon="🤔" label={data.label}>
      <Target id="query" angle={targetAngles[0]} />
      <Target id="subject" angle={targetAngles[1]} />

      <Source id="relevant" angle={sourceAngles[0]} />
      <Source id="notRelevant" angle={sourceAngles[1]} />
    </CircularNode>
  );
}

type HandleProps = {
  id: string;
  angle: number;
};

function Target({ id, angle }: HandleProps) {
  const coords = angleToCoordinates(angle, RADIUS);
  return (
    <BaseHandle
      id={id}
      type="target"
      position={Position.Left}
      className="flex items-center justify-center text-[var(--text)]"
      style={{
        left: RADIUS + coords.x,
        top: RADIUS + coords.y,
      }}
    />
  );
}

function Source({ id, angle }: HandleProps) {
  const coords = angleToCoordinates(angle, RADIUS);
  return (
    <div
      className="group/handle absolute !left-[var(--left)] !top-[var(--top)] hover:!left-[calc(var(--left)+var(--hover-left))] hover:!top-[calc(var(--top)+var(--hover-top))] transition-[top,left] -translate-x-1/2 -translate-y-1/2 before:content-[''] before:size-6 before:-ml-6 flex"
      style={
        {
          "--left": `${RADIUS + coords.x}px`,
          "--hover-left": `${Math.cos((angle * Math.PI) / 180) * 12}px`,
          "--top": `${RADIUS + coords.y}px`,
          "--hover-top": `${Math.sin((angle * Math.PI) / 180) * 12}px`,
        } as React.CSSProperties
      }
    >
      <BaseHandle
        id={id}
        type="source"
        position={Position.Right}
        className="!static flex items-center justify-center text-[var(--text)] !transform-none"
      >
        <Plus className="size-4 opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none" />
      </BaseHandle>
    </div>
  );
}
