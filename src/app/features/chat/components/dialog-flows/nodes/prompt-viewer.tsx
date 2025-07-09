
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDialogFlowStore, useGlobalDialogFlowStore } from "../store";
import { Textarea } from "@/components/ui/textarea";
import { ExtractorNode, PrecedentTypes } from "../nodes";
import { cn } from "@/lib/utils";



function compileExtractionPrompt(node: ExtractorNode) {
  // invariant(, "graphId is undefined");
  const prompts: string[] = [];
  const nodeId = node.id;

  const intro = [
    "You are a helpful assistant tasked to extract facts from a case and assess the client's relevance to a number of legal citations.",
    "Each citation has a description and possibly a list of previous judgements derived from lower court decisions.",
  ];
  prompts.push(intro.join("\n"));

  // add facts of the case
  prompts.push(node.data.factPrompt)

  for (const criterion of node.data.criteria) {

    if (!node) continue;

    // add body
    const body = [
      "*************************",
      "Name: " + criterion.label,
      "Citation: " + criterion.citation,
      "Description: " + criterion.description,
    ];
    prompts.push(body.join('\n'))

    // check type
    switch (criterion.type) {
      case PrecedentTypes.STATUTE: {
        const prompt = [
          `This is a statute.`,
        ];
        prompts.push(prompt.join('\n'));
        break;
      }
      case PrecedentTypes.REGULATION: {
        const prompt = [
          `Node ${nodeId} is an instruction node.`,
          // dependencies.length > 0 ? `When ${describeRelationships(dependencies)}, you must ${node.data.body}.` : `You must ${node.data.body}.`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case PrecedentTypes.UNKNOWN: {
        // `The type of this node is unknown.`
        break;
      }
      default: {
        // This is an exhaustive check to ensure that all node types are handled.
        // const exhaustiveCheck: never = ;
        throw new Error(`Unhandled node type: ${node.type}`);
      }
    }
    // perform RAG, on the facts, on cases that cite this precedent

  }

  return prompts.join("\n\n");
}

export function PromptViewer(node: ExtractorNode) {
   const { graphId, name, nodes, edges } = useDialogFlowStore();
   const { isOutdated, compiledDialogFlow, setCompiledDialogFlow } =
     useGlobalDialogFlowStore();
 
   const [value, setValue] = useState("");
   const hasChanges = value !== compiledDialogFlow?.prompt;
 
   return (
     <Dialog>
       <DialogTrigger asChild>
         <Button
           className="hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 bg-white px-3 h-9"
           variant="ghost"
           onClick={() => {
             if (isOutdated || !compiledDialogFlow) {
               const prompt = compileExtractionPrompt(node); // does not have access to graphId
               setCompiledDialogFlow({ prompt, name });
               setValue(prompt);
             } else {
               setValue(compiledDialogFlow.prompt);
             }
           }}
         >
           Prompt
         </Button>
       </DialogTrigger>
       <DialogContent className="max-w-5xl h-[1024px] max-h-[calc(100vh-48px)] p-4 flex flex-col gap-4 w-full !top-6 !translate-y-[unset]">
         <DialogHeader>
           <DialogTitle className="flex gap-2 items-center pt-1">
             <span>Extractor Node Prompt</span>
             {hasChanges && (
               <span className="text-xs text-amber-500 font-normal">
                 Unsaved changes
               </span>
             )}
           </DialogTitle>
           <DialogDescription>
             Edit the prompt to adjust how responses are generated. Changes apply
             only to this session and won't be saved.
           </DialogDescription>
         </DialogHeader>
 
         <Textarea
           className="flex-1"
           value={value}
           onChange={(e) => setValue(e.target.value)}
         />
 
         <DialogClose asChild>
           <Button
             className={cn("w-full", !hasChanges && "opacity-50")}
             disabled={!hasChanges}
             onClick={() => {
               setCompiledDialogFlow({
                 name: compiledDialogFlow!.name,
                 prompt: value.trim(),
                 isCustom: true,
               });
             }}
           >
             Save
           </Button>
         </DialogClose>
       </DialogContent>
     </Dialog>
   );
 }