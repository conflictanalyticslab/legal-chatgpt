'use client'
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useChatContext } from "./store/ChatContext";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { pdfSearch } from "./utils/pdfs/pdf_utils";

const SearchModal = () => {
  const { relevantDocs, setRelevantDocs, documentQuery, setDocumentQuery, namespace, documentQueryMethod, setAlert, pdfLoading, setPdfLoading, globalSearch } = useChatContext();

  const formSchema = z.object({
    documentQuery: z.string().min(0, {
      message: "Query shouldn't be empty",
    }).optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentQuery: documentQuery,
    },
  });

  const onsubmit = async (form: z.infer<typeof formSchema>) => {
    if (pdfLoading) return;
    setPdfLoading(true);
    
    // Chooses which method we are using to query for the pdf
    pdfSearch(
      documentQueryMethod,
      documentQuery,
      namespace,
      setAlert,
      setRelevantDocs,
      setPdfLoading,
      globalSearch
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="w-full flex gap-5 justify-start">
          <Image
            src="/assets/icons/search.svg"
            height={15}
            width={15}
            alt="search"
          />
          Search PDFs
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[60vw] flex flex-col gap-5 overflow-auto box-border"
      >
        <DialogTitle className="hidden"></DialogTitle>

        {/* Search Document Input */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="documentQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">
                    Search for relevant PDFs.
                  </FormLabel>
                  <div className="flex gap-4">
                    {/* Document Query Input */}
                    <FormControl>
                      <Input
                        placeholder="What is employment Law?"
                        {...field}
                        value={documentQuery}
                        onChange={(event) =>
                          setDocumentQuery(event.target.value)
                        }
                        disabled={pdfLoading}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Document List Container */}
        <div
          className={cn(
            `flex flex-col gap-3 w-full bg-transparent relative h-full `
          )}
        >
          {/* List of Documents */}
          {pdfLoading ? (
            // Loading animation for relevant documents
            <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center gap-3 flex-col">
              Finding Relevant Documents
              <LoadingSpinner />
            </Label>
          ) : relevantDocs && relevantDocs.length > 0 ? (
            relevantDocs.map((doc: any, i: number) => (
              <Card key={i}>
                <a href={doc.url} target="_blank">
                  <CardHeader>
                    <CardTitle className="font-normal">
                      {doc.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <Label className="font-bold">URL:</Label>
                      <output>{doc.url}</output>
                    </div>
                    <div className="flex flex-col">
                      <Label className="font-bold">Abstract</Label>
                      <output className="max-h-[200px] text-ellipsis line-clamp-6">
                        {doc.content}
                      </output>
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))
          ) : (
            // No documents available
            <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              No Documents Available.
            </Label>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
