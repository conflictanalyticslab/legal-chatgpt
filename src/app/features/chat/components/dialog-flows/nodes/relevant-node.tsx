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
      <Target
        id="query"
        angle={targetAngles[1]}
        color="#ecfccb" /* lime.100 */
      />
      <Target
        id="subject"
        angle={targetAngles[0]}
        color="#e0f2fe" /* sky.100 */
      />

      <Source
        id="relevant"
        angle={sourceAngles[0]}
        color="#fef3c7" /* amber.100 */
      />
      <Source
        id="notRelevant"
        angle={sourceAngles[1]}
        color="#ffe4e6" /* rose.100 */
      />
    </CircularNode>
  );
}

type HandleProps = {
  id: string;
  angle: number;
  color: string;
};

function Target({ id, angle, color }: HandleProps) {
  const coords = angleToCoordinates(angle, RADIUS);
  return (
    <BaseHandle
      id={id}
      type="target"
      position={Position.Left}
      className="flex items-center justify-center text-[var(--text)]"
      style={
        {
          left: RADIUS + coords.x,
          top: RADIUS + coords.y,
          "--bg": color,
        } as React.CSSProperties
      }
    />
  );
}

function Source({ id, angle, color }: HandleProps) {
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
          "--bg": color,
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
