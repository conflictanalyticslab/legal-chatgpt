import { DocumentQueryOptions } from "@/app/(private)/chat/enum/enums";
import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";

export function DatasetSelection() {
  const {
    namespace,
    setNamespace,
    enableRag,
    documentQueryMethod,
    setIndexName,
    indexName,
  } = useChatContext();

  useEffect(() => {
    console.log(indexName);
  }, [indexName]);
  return (
    <div className="flex flex-col gap-3 px-2">
      <Label className="font-bold">Datasets</Label>
      <RadioGroup onValueChange={setIndexName}>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem id="french_law" value={"french_law"} />
          <Label htmlFor="french_law">Leidan IAL</Label>
        </span>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem id="australian_law" value={"australian_law"} />
          <Label htmlFor="australian_law">Australian Scrutiny</Label>
        </span>
      </RadioGroup>
    </div>
  );
}
