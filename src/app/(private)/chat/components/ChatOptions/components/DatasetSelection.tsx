import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PineconeIndexes, PineconeNamespaces } from "../../../enum/enums";

export function DatasetSelection() {
  const { setNamespace, namespace, setIndexName } = useChatContext();

  const handleChangeDataset = (value: string) => {
    setNamespace(value);
    localStorage.setItem("namespace", JSON.stringify(value));

    if (value === PineconeNamespaces.unitedStates_law) {
      setIndexName(PineconeIndexes.dynamicDocuments);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-2">
      <Label className="font-bold">Datasets</Label>
      <RadioGroup value={namespace} onValueChange={handleChangeDataset} className="flex flex-col gap-5">
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id={PineconeNamespaces.canadian_law}
            value={PineconeNamespaces.canadian_law}
          />
          <Label htmlFor={PineconeNamespaces.canadian_law}>Canada</Label>
        </span>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id={PineconeNamespaces.unitedStates_law}
            value={PineconeNamespaces.unitedStates_law}
          />
          <Label htmlFor={PineconeNamespaces.unitedStates_law}>
            United States
          </Label>
        </span>
        {/* <span className="flex justify-start items-center gap-2">
          <RadioGroupItem id="french" value={"french"} />
          <Label htmlFor="french">French</Label>
        </span> */}
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id="french_law"
            value={PineconeNamespaces.french_law}
          />
          <Label htmlFor="french_law">Leiden IAL</Label>
        </span>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id={PineconeNamespaces.australian_law}
            value={PineconeNamespaces.australian_law}
          />
          <Label htmlFor={PineconeNamespaces.australian_law}>
            Australian Scrutiny
          </Label>
        </span>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id={PineconeNamespaces.minimum_standards_termination}
            value={PineconeNamespaces.minimum_standards_termination}
          />
          <Label htmlFor={PineconeNamespaces.minimum_standards_termination}>
            Notice of Termination (Minimum Standards)
          </Label>
        </span>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id={PineconeNamespaces.reasonable_notice_termination}
            value={PineconeNamespaces.reasonable_notice_termination}
          />
          <Label htmlFor={PineconeNamespaces.reasonable_notice_termination}>
            Reasonable Notice of Termination
          </Label>
        </span>
        <span className="flex justify-start items-center gap-2">
          <RadioGroupItem
            id={PineconeNamespaces.without_cause_termination}
            value={PineconeNamespaces.without_cause_termination}
          />
          <Label htmlFor={PineconeNamespaces.without_cause_termination}>
            Reviewing a Without Cause Termination Clause
          </Label>
        </span>
      </RadioGroup>
    </div>
  );
}
