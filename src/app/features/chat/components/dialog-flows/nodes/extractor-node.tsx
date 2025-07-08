import { Handle, useStore, Position, type NodeProps } from "@xyflow/react";
import { TextSearch, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUpdateNodeInternals } from "@xyflow/react";
import { PromptViewer } from "./prompt-viewer";

import CircularNode from "./circular-node";
import type {NodePropertiesPanelProps} from "../properties";
import { useDialogFlowStore, useGlobalDialogFlowStore} from "../store";
import { GraphFlowEdge, GraphFlowNode } from "../nodes";
import invariant from "tiny-invariant";

import type { ExtractorNode } from "../nodes";
import { cn } from "@/lib/utils";
import { ulid } from "ulid";

export default function ExtractorNode({
  id,
  data,
}: NodeProps<ExtractorNode>) {
  const isConnectable = useStore((s) => s.nodesConnectable);

  return (
    <CircularNode
      icon={<TextSearch className="size-8 text-neutral-700" />}
      label={data.label}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={!isConnectable ? "!cursor-default" : undefined}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "flex items-center justify-center text-[var(--text)]",
          isConnectable
            ? "group-hover:-mr-3 transition-[margin]"
            : "!cursor-default"
        )}
      >
        {isConnectable && (
          <Plus className="size-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </Handle>
    </CircularNode>
  );
}

interface CriteriaPropertiesPanelProps {
  index: number;
  criteria: ExtractorNode["data"]["criteria"][number];
  updateCriteria: (
    id: string,
    fn: (
      criteria: ExtractorNode["data"]["criteria"][number]
    ) => ExtractorNode["data"]["criteria"][number]
  ) => void;
  deleteCriteria: () => void;
}

function CriteriaPropertiesPanel({
  index,
  criteria,
  updateCriteria,
  deleteCriteria,
}: CriteriaPropertiesPanelProps) {
  // const { origin } = useDialogFlowStore();

  const [label, setLabel] = useState(criteria.label);
  const [desc, setDesc] = useState(criteria.description);

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateCriteria(criteria.id, (thatCriteria) => {
      return {
        ...thatCriteria,
        label: event.target.value,
      };
    });
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(event.target.value);
    updateCriteria(criteria.id, (thatCriteria) => {
      return {
        ...thatCriteria,
        body: event.target.value,
      };
    });
  };

  // prettier-ignore
  // const color = SWITCH_NODE_CONDITION_COLORS[index % SWITCH_NODE_CONDITION_COLORS.length];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border-2 border-white"
            // style={{ backgroundColor: criteria.color}}
          />
          <span className="text-sm">Criteria {index + 1}</span>
        </div>
        {origin !== "universal" && (
          <button
            className="text-sm text-red-500 hover:underline rounded-md"
            onClick={deleteCriteria}
          >
            Delete
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>

        <Input
          value={label}
          onChange={onLabelChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Body:</Label>

        <Textarea
          placeholder="You can leave this empty"
          wrap="soft"
          value={desc}
          rows={2}
          onChange={onBodyChange}
        />
      </div>
    </div>
  );
}

export function ExtractorNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<ExtractorNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const { origin } = useDialogFlowStore();

  const [label, setLabel] = useState(node.data.factDescription);
  const [desc, setDesc] = useState(node.data.factPrompt);

  
  const {
      isOutdated,
      setIsOutdated,
      compiledDialogFlow,
      setCompiledDialogFlow,
    } = useGlobalDialogFlowStore();
  

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, factDescription: event.target.value},
      };
    });
  };

  useEffect(() => {
    setLabel(node.data.factDescription);
  }, [node]);

  
  const onDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDesc(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, factPrompt: event.target.value },
      };
    });
  };
  useEffect(() => {
    if (node.data.factPrompt.length > 0) {
    setDesc(node.data.factPrompt);}
  }, [node]);

  const deleteCriteria = (id: string) => {
    // onSourceChange(id);

    updateNode(node.id, (node) => {
      return {
        ...node,
        data: {
          ...node.data,
          criteria: node.data.criteria.filter(
            (criteria) => criteria.id !== id
          ),
        },
      };
    });
    updateNodeInternals(node.id);
  };

  const updateCriteria = useCallback(
    (
      id: string,
      fn: (
        condition: ExtractorNode["data"]["criteria"][number]
      ) => ExtractorNode["data"]["criteria"][number]
    ) => {
      updateNode(node.id, (node) => {
        const conditions = node.data.criteria.map((criterion) =>
          criterion.id === id ? fn(criterion) : criterion
        );

        return {
          ...node,
          data: { ...node.data, conditions },
        };
      });
    },
    [node]
  );

   const addCriteria = useCallback(() => {
      // prettier-ignore
      // const color = SWITCH_NODE_CONDITION_COLORS[node.data.conditions.length % SWITCH_NODE_CONDITION_COLORS.length];
      updateNode(node.id, (node) => {
        return {
          ...node,
          data: {
            ...node.data,
            conditions: [
              ...node.data.criteria,
              {
                id: ulid(),
                label: "If...",
                description: "",
                precedent: "",
                // color: "",
                // color,
              },
            ],
          },
        };
      });
      updateNodeInternals(node.id);
    }, [node]);

    const compilePrompt = useCallback(() => {
      // prettier-ignore
      // const color = SWITCH_NODE_CONDITION_COLORS[node.data.conditions.length % SWITCH_NODE_CONDITION_COLORS.length];
      updateNode(node.id, (node) => {
        return {
          ...node,
          data: {
            ...node.data,
            conditions: [
              ...node.data.criteria,
              {
                id: ulid(),
                label: "If...",
                description: "",
                precedent: {type: "",
                  citation: "",
                  body: "",
                },
                // color: "",
                // color,
              },
            ],
          },
        };
      });
      updateNodeInternals(node.id);
    }, [node]);

  // return (
  //   <div className="flex flex-col gap-2">
  //     <Label className="text-neutral-500">Label:</Label>
  //     <Input
  //       value={label}
  //       onChange={onLabelChange}
  //     />
  //     <Label className="text-neutral-500">Fact to extract:</Label>
  //     <Input
  //       value={desc}
  //       defaultValue={'e.g. Check for possible signs of harassment in the workplace'}
  //       onChange={onDescChange}
  //     />
  //   </div>
  // );

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input
          value={label}
          // name='label'
          onChange={onLabelChange}
        />
       <Label className="text-neutral-500">Fact to extract:</Label>
       <Input
         value={desc}
        //  defaultValue={'e.g. Check for possible signs of harassment in the workplace'}
         onChange={onDescChange}
       />
      </div>
      {node.data.criteria.map((criteria, i) => (
        <CriteriaPropertiesPanel
          index={i}
          key={criteria.id}
          criteria={criteria}
          updateCriteria={updateCriteria}
          deleteCriteria={() => deleteCriteria(criteria.id)}
        />
      ))}

      {origin !== "universal" && (
        <Button className="w-full shrink-0" size="sm" onClick={addCriteria}>
          Add Criteria
        </Button>
      )}
      
        <PromptViewer id={""} position={{
        x: 0,
        y: 0
      }} data={node.data} />
    </>
  );
}
