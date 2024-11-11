import React, { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipPortal} from "@radix-ui/react-tooltip";

export default function GraphEditPanel({
  currentChosenIsNode, chosenLabel, setChosenLabel, chosenBody, setChosenBody, chosenColor, setChosenColor, usePublicDF, setUsePublicDF
}:{
  currentChosenIsNode: boolean,
  chosenLabel: string,
  setChosenLabel: React.Dispatch<React.SetStateAction<string>>,
  chosenBody: string,
  setChosenBody: React.Dispatch<React.SetStateAction<string>>,
  chosenColor: string,
  setChosenColor: React.Dispatch<React.SetStateAction<string>>,
  usePublicDF: boolean,
  setUsePublicDF: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [useCustomLabel, setUseCustomLabel] = useState<boolean>(false);
  const [useCustomColor, setUseCustomColor] = useState<boolean>(false);

  return (
    <div className="px-4 flex flex-col divide-y">
      {/* Node or Edge */}
      <div className="py-4">
        {currentChosenIsNode? (
          <Label className="text-[grey]">Editing Node</Label>
        ) : (
          <Label  className="text-[grey]">Editing Edge</Label>
        )}
      </div>
      
      {/* Global Toggles */}
      <Tooltip>

        <TooltipTrigger asChild>
          <div className="flex flex-col py-4 space-y-4">
            <div className="flex flex-row space-x-2">
              <Switch checked={usePublicDF} onCheckedChange={(checked: boolean) => setUsePublicDF(checked)}/>
              <Label className="py-2">Make the DF Public</Label>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipPortal container={document.getElementById("df-main")}>
          <TooltipContent side="left">
            <Label className="shadow-lg">
              Make your DF public. This change will not be reflected until you hit save. 
            </Label>
          </TooltipContent> 
        </TooltipPortal>
        
      </Tooltip>

      {/* Item-Specific Toggles */}
      
      <Tooltip>

        <TooltipTrigger asChild>
          <div className="flex flex-col py-4 space-y-4">
            <div className="flex flex-row space-x-2">
              <Switch checked={useCustomLabel} onCheckedChange={(checked: boolean) => setUseCustomLabel(checked)}/>
              <Label className="py-2">Use Custom Label</Label>
            </div>

            <div className="flex flex-row space-x-2">
              <Switch checked={useCustomColor} onCheckedChange={(checked: boolean) => setUseCustomColor(checked)}/>
              <Label className="py-2">Use Custom Color</Label>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipPortal container={document.getElementById("df-main")}>
          <TooltipContent side="left">
            <Label className="shadow-lg">
              Customize how your graph is displayed. OpenJustice will NOT use this to generate a response.
            </Label>
          </TooltipContent> 
        </TooltipPortal>

      </Tooltip>

      {/* Item Fields */}
      
      <div className="py-4">
        {useCustomLabel && (
          <Tooltip>

            <TooltipTrigger asChild>
              <div className="flex flex-col">
                <Label className="py-2">Label:</Label>
                <Input
                  value={chosenLabel}
                  onChange={(event) => setChosenLabel(event.target.value)} 
                />
              </div>
            </TooltipTrigger>

            <TooltipPortal container={document.getElementById("df-main")}>
              <TooltipContent side="left">
                <Label className="shadow-lg">
                  Edit how the node or edge is shown in the Dialog Flow window. OpenJustice will NOT use this to generate a response.
                </Label>
              </TooltipContent> 
            </TooltipPortal>

          </Tooltip>
        )}

        {useCustomColor && (
          <Tooltip>

            <TooltipTrigger asChild>
              <div className="flex flex-col">
                <Label className="py-2">Color:</Label>
                <Input
                  className="nodrag"
                  type="color"
                  defaultValue='#FFFFFF'
                  value={chosenColor}
                  onChange={(event) => setChosenColor(event.target.value)} 
                />
              </div>
            </TooltipTrigger>

            <TooltipPortal container={document.getElementById("df-main")}>
              <TooltipContent side="left">
                <Label className="shadow-lg">
                  Edit the color of the node or edge in the Dialog Flow window. OpenJustice will NOT use this to generate a response.
                </Label>
              </TooltipContent> 
            </TooltipPortal>

          </Tooltip>
        )}
        
        <Tooltip>

          <TooltipTrigger asChild>
            <div className="flex flex-col">
              <Label className="py-2">Body:</Label>
              <Textarea
                placeholder="You can leave this empty"
                wrap="soft" 
                value={chosenBody} 
                rows={10}
                onChange={(event) => setChosenBody(event.target.value)} 
              /> 
            </div>
          </TooltipTrigger>

          <TooltipPortal container={document.getElementById("df-main")}>
            <TooltipContent side="left">
              <Label className="shadow-lg bg-inherit">
                Edit the content of the node or edge. OpenJustice will use this to generate a response.
              </Label>
            </TooltipContent> 
          </TooltipPortal>

        </Tooltip>
      </div>
    </div>
  );
}