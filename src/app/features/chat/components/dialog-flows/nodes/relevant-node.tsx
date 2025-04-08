import {
  Handle as BaseHandle,
  useStore,
  useEdges,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";

import CircularNode, { RADIUS } from "./circular-node";

import type { RelevantNode } from "../nodes";
import { cn } from "@/lib/utils";
import { angleToCoordinates, calculateHandleAngles } from "./helpers";

export default function RelevantNode({ id, data }: NodeProps<RelevantNode>) {
  const targetAngles = calculateHandleAngles(2, 180);
  const sourceAngles = calculateHandleAngles(2, 0);

  const connectedSources = useEdges().reduce((handleIds, edge) => {
    if (edge.source !== id || !edge.sourceHandle) return handleIds;
    return [...handleIds, edge.sourceHandle];
  }, [] as string[]);

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
        isConnected={connectedSources.includes("relevant")}
      />
      <Source
        id="notRelevant"
        angle={sourceAngles[1]}
        color="#ffe4e6" /* rose.100 */
        isConnected={connectedSources.includes("notRelevant")}
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

  const isConnectable = useStore((s) => s.nodesConnectable);

  return (
    <BaseHandle
      id={id}
      type="target"
      position={Position.Left}
      className={cn(
        "flex items-center justify-center text-[var(--text)]",
        !isConnectable && "!cursor-default"
      )}
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

function Source({
  id,
  angle,
  color,
  isConnected,
}: HandleProps & { isConnected: boolean }) {
  const coords = angleToCoordinates(angle, RADIUS);

  const isConnectable = useStore((s) => s.nodesConnectable);

  return (
    <div
      className={cn(
        "absolute !left-[var(--left)] !top-[var(--top)] -translate-x-1/2 -translate-y-1/2",
        isConnectable &&
          !isConnected &&
          "group/handle hover:!left-[calc(var(--left)+var(--hover-left))] hover:!top-[calc(var(--top)+var(--hover-top))] transition-[top,left] before:content-[''] before:size-6 before:-ml-6 flex"
      )}
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
        className={cn(
          "!static flex items-center justify-center text-[var(--text)] !transform-none",
          !isConnectable && "!cursor-default"
        )}
      >
        {isConnectable && !isConnected && (
          <Plus className="size-4 opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none" />
        )}
      </BaseHandle>
    </div>
  );
}
