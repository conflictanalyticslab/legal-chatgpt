import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import React, { useEffect } from "react";
import { useChatContext } from "../../../store/ChatContext";
import { usePdfSearch } from "../../../hooks/usePdfSearch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PineconeNamespaces } from "../../../enum/enums";

export default function Documents() {
  const { relevantDocs, documentQuery, namespace, pdfLoading } =
    useChatContext();
  const { pdfSearch } = usePdfSearch();

  const formSchema = z.object({
    documentQuery: z.string().min(0, {
      message: "Query shouldn't be empty",
    }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentQuery: documentQuery,
    },
  });

  const handleSearchDocuments = async (form: z.infer<typeof formSchema>) => {
    if (pdfLoading) return;
    pdfSearch(form.documentQuery, namespace);
  };
  useEffect(() => {
    form.setValue("documentQuery", documentQuery, {
      shouldValidate: true, // Optional: Trigger validation if necessary
      shouldDirty: true, // Optional: Mark the field as dirty
    });
  }, [documentQuery]);
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="1"
      className=""
    >
      <AccordionItem value={"1"} className="border-b-0 overflow-hidden">
        <AccordionTrigger>
          <Label className="font-bold">Search Documents</Label>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden flex flex-col gap-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSearchDocuments)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="documentQuery"
                render={({ field }) => (
                  <FormItem>
                    {/* Document Query Input */}
                    <FormControl>
                      <Input
                        placeholder="What is employment Law?"
                        {...field}
                        disabled={
                          pdfLoading ||
                          namespace === PineconeNamespaces.no_dataset
                        }
                        className="w-full bg-[#f8f8f8] text-left text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* Document List Container */}
          <div
            className={cn(
              `flex flex-col gap-3 w-full bg-transparent relative h-full overflow-auto pb-[50px]`
            )}
          >
            {/* List of Documents */}
            {pdfLoading && namespace !== PineconeNamespaces.no_dataset ? (
              // Loading animation for relevant documents
              <Label className="text-[grey] flex items-center gap-3 justify-center h-full flex-col text-nowrap">
                Finding Relevant Documents
                <LoadingSpinner />
              </Label>
            ) : relevantDocs && relevantDocs.length > 0 ? (
              relevantDocs.map((doc: any, i: number) => (
                <Card key={i} className="bg-[#f8f8f8]">
                  <a href={doc.url} target="_blank" className="cursor-pointer">
                    <CardHeader className="pt-4 pb-2 px-6">
                      <CardTitle className="font-bold text-base truncate">
                        {doc.fileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <Label className="font-normal">URL:</Label>
                        <output className="text-[#0000EE] truncate text-xs">
                          {doc.url}
                        </output>
                      </div>
                      <div className="flex flex-col">
                        <Label className="font-normal">Abstract</Label>
                        <output className="max-h-[200px] text-ellipsis line-clamp-6 text-xs">
                          {doc.content}
                        </output>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))
            ) : (
              // No documents available
              <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-nowrap">
                No Documents Available.
              </Label>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
