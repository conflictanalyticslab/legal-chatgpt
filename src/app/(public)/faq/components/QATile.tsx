import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React, { ReactElement } from "react";

export default function QATile({
  question,
  children,
  icon,
}: {
  question: string;
  children: ReactElement;
  icon: ReactElement;
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex gap-5 justify-start pr-3 items-center">
            <span>{icon}</span>
            <span>{question}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
