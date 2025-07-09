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
import "../xy-theme.css";
import "@xyflow/react/dist/base.css";

import CircularNode from "./circular-node";
import type {NodePropertiesPanelProps} from "../properties";
import { useDialogFlowStore} from "../store";
import { PrecedentTypes } from "../facts";

import type { ExtractorNode } from "../nodes";
import { cn } from "@/lib/utils";
import { ulid } from "ulid";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { usePdfSearch } from "../../../hooks/use-pdf-search";
import { useGlobalContext } from "@/app/store/global-context";
import { SearchResults } from "../facts";

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
  const [precedent, setPrecedent] = useState(criteria.citation);
  // const [t, setType] = useState(criteria.precedent.type);

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(event.target.value);
    updateCriteria(criteria.id, (thatCriteria) => {
      return {
        ...thatCriteria,
        description: event.target.value,
      };
    });
  };
  
  const onPrecedentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrecedent(event.target.value);
    updateCriteria(criteria.id, (thatCriteria) => {
      return {
        ...thatCriteria,
        citation: event.target.value,
      };
    });
  };
  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateCriteria(criteria.id, (thatCriteria) => {
      return {
        ...thatCriteria,
        label: event.target.value,
      };
    });
  };
  // const onTypeChange = (event: React.ChangeEvent<>) => {
  //   setType(event.target.value);
  //   updateCriteria(criteria.id, (thatCriteria) => {
  //     return {
  //       ...thatCriteria,
  //       precedent: {id: thatCriteria.precedent.id,
  //                   type: event.target.value,
  //                   citation: thatCriteria.precedent.citation},
  //     };
  //   });
  // };


  // prettier-ignore
  // const color = SWITCH_NODE_CONDITION_COLORS[index % SWITCH_NODE_CONDITION_COLORS.length];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {/* <div
            className="size-5 rounded-full border-2 border-white"
            // style={{ backgroundColor: criteria.color}}
          /> */}
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
          placeholder="A high-level name for the criteria"
          // wrap="soft"
          value={label}
          onChange={onLabelChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Citation:</Label>

        <Textarea
          placeholder="Cite a source where this criteria is from"
          wrap="soft"
          value={precedent}
          // rows
          onChange={onPrecedentChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        
        <Label className="text-neutral-500">Description:</Label>

        <Textarea
          placeholder="Describe or quote the criteria to assess"
          wrap="soft"
          value={desc}
          rows={2}
          onChange={onBodyChange}
        />
      </div>
        {/* <select value={t} onChange={onTypeChange}>
          {Object.keys(PrecedentTypes).map(key => (
          <option key={key} value={key}>
            {PrecedentTypes[key]}
          </option>
        ))}
      </select> */}
    </div>
  );
}

export function ExtractorNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<ExtractorNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const { origin } = useDialogFlowStore();

  const [label, setLabel] = useState(node.data.label);
  const [desc, setDesc] = useState(node.data.factPrompt);

  const [doSearch, setDoSearch] = useState(node.data.searchCaseLaw);

  // const {
  //     isOutdated,
  //     setIsOutdated,
  //     compiledDialogFlow,
  //     setCompiledDialogFlow,
  //   } = useGlobalDialogFlowStore();
  

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, label: event.target.value},
      };
    });
  };

  useEffect(() => {
    setLabel(node.data.label);
  }, [node]);

  
  const onDescChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        const criteria = node.data.criteria.map((criterion) =>
          criterion.id === id ? fn(criterion) : criterion
        );

        return {
          ...node,
          data: { ...node.data, criteria },
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
            criteria: [
              ...node.data.criteria,
              {
                id: ulid(),
                label: "",
                description: "",
                type: PrecedentTypes.UNKNOWN,
                citation: "",
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
       <Textarea
         value={desc}
         placeholder="e.g. Check for possible signs of harassment in the workplace"
        //  defaultValue={'e.g. Check for possible signs of harassment in the workplace'}
         onChange={onDescChange}
       />
       <div className="flex flex-row items-center gap-2 justify-between">
          <Label className="text-neutral-500">Search Case Law</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              
              <Switch
                // color=""
                checked={doSearch}
                onCheckedChange={(checked) => {
                  setDoSearch(checked);
                  // setUpdate((prev) => prev + 1);
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5}>
              Search for cases with similar facts that contain any of the specified citations.
            </TooltipContent>
          </Tooltip>
        </div>
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
      {doSearch && (
        <SearchResults />
      )}
        <PromptViewer id={""} position={{
        x: 0,
        y: 0
      }} data={node.data} />
    </>
  );
}
