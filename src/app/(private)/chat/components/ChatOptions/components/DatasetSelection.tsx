import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PineconeIndexes, PineconeNamespaces } from "../../../enum/enums";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function DatasetSelection() {
  const { setNamespace, namespace, setIndexName, loading } = useChatContext();

  const handleChangeDataset = (value: string) => {
    setNamespace(value);
    localStorage.setItem("namespace", JSON.stringify(value));

    if (value === PineconeNamespaces.unitedStates_law) {
      setIndexName(PineconeIndexes.dynamicDocuments);
    }
  };

  return (
    <Accordion type="single" collapsible defaultValue="1" className="">
      <AccordionItem value={"1"} className="border-b-0">
        <AccordionTrigger>
          <Label className="font-bold">Datasets</Label>
        </AccordionTrigger>
        <AccordionContent className="border-0 overflow-auto">
          <RadioGroup
            value={namespace}
            onValueChange={handleChangeDataset}
            className="flex flex-col gap-5"
            disabled={loading}
          >
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.no_dataset}
                value={PineconeNamespaces.no_dataset}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.no_dataset}
              >
                No Dataset
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.canadian_law}
                value={PineconeNamespaces.canadian_law}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.canadian_law}
              >
                Canada
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.unitedStates_law}
                value={PineconeNamespaces.unitedStates_law}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.unitedStates_law}
              >
                United States
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id="french_law"
                value={PineconeNamespaces.french_law}
              />
              <Label className="cursor-pointer" htmlFor="french_law">
                Leiden IAL
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.australian_law}
                value={PineconeNamespaces.australian_law}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.australian_law}
              >
                Australian Scrutiny
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.minimum_standards_termination}
                value={PineconeNamespaces.minimum_standards_termination}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.minimum_standards_termination}
              >
                Notice of Termination (Minimum Standards)
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.reasonable_notice_termination}
                value={PineconeNamespaces.reasonable_notice_termination}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.reasonable_notice_termination}
              >
                Reasonable Notice of Termination
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.without_cause_termination}
                value={PineconeNamespaces.without_cause_termination}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.without_cause_termination}
              >
                Reviewing a Without Cause Termination Clause
              </Label>
            </span>

            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.constructive_dismissal}
                value={PineconeNamespaces.constructive_dismissal}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.constructive_dismissal}
              >
                Constructive Dismissal
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.factors_affecting_notice}
                value={PineconeNamespaces.factors_affecting_notice}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.factors_affecting_notice}
              >
                Factors Affecting Notice
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.just_cause_dismissal}
                value={PineconeNamespaces.just_cause_dismissal}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.just_cause_dismissal}
              >
                Just Cause Dismissal
              </Label>
            </span>
            <span className="flex justify-start items-center gap-2">
              <RadioGroupItem
                id={PineconeNamespaces.procedure_on_dismissal}
                value={PineconeNamespaces.procedure_on_dismissal}
              />
              <Label
                className="cursor-pointer"
                htmlFor={PineconeNamespaces.procedure_on_dismissal}
              >
                Procedure on Dismissal
              </Label>
            </span>
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
