'use client'
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { similaritySearch } from "./actions/semantic-search";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useChatContext } from "./store/ChatContext";

const SearchModal = () => {
  const { relevantPDFs, setRelevantPDFs, LLMQuery } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    pdfQuery: z.string().min(0, {
      message: "Query shouldn't be empty",
    }).optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pdfQuery: LLMQuery,
    },
  });

  const onsubmit = async (form: z.infer<typeof formSchema>) => {
    if(isLoading)
      return;
    
    setIsLoading(true);

    const query = form?.pdfQuery

    try
    {
      const similarDocs = await similaritySearch(query || '', 3)
      setRelevantPDFs(similarDocs.matches);
    }
    catch(e) 
    {
      console.log(e);
    }

    setIsLoading(false);
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
      <DialogContent className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[60vw] flex flex-col gap-5 overflow-auto box-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="pdfQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">
                    Search for relevant PDFs.
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What is employment Law?"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div
          className={cn(
            `flex flex-col gap-3 w-full bg-transparent relative ${
              relevantPDFs.length === 0 ? "h-full" : "h-[min-content]"
            }`
          )}
        >
          {relevantPDFs && relevantPDFs.length > 0 ? (
            relevantPDFs.map((doc: any) => (
              <Card>
                <a href={doc.metadata.url} target="_blank">
                  <CardHeader>
                    <CardTitle className="font-normal">
                      {doc.metadata.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <Label className="font-bold">URL:</Label>
                      <output>{doc.metadata.url}</output>
                    </div>
                    <div className="flex flex-col">
                      <Label className="font-bold">Abstract</Label>
                      <output className="max-h-[200px] text-ellipsis line-clamp-6">
                        {doc.metadata.text}
                      </output>
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))
          ) : isLoading ? (
            <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center gap-3 flex-col">
              Finding Relevant Documents
              <svg
                className="animate-spin h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </Label>
          ) : (
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
