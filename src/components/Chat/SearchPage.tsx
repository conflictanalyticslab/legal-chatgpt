"use client";

import React, { useEffect, useState } from "react";
import {
  ErrorBoundary,
} from "@elastic/react-search-ui";
import { FormLabel, Typography } from "@mui/material";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { Input } from "../ui/input";
import { useChatContext } from "./store/ChatContext";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { similaritySearch } from "./actions/semantic-search";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";



const SearchPage = () => {
  const { relevantPDFs, setRelevantPDFs, LLMQuery } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    pdfQuery: z.string().min(1, {
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
      return
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
    <div className="flex flex-col h-full ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="pdfQuery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search for relevant PDFs.</FormLabel>
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
      <Card className="flex flex-col gap-6 w-full mt-5 bg-[#fcfcfc] h-full p-3 relative overflow-auto">
        <h1 className="text-center mt-3 text-2xl font-bold">
          Relevant Documents
        </h1>

        {(relevantPDFs && relevantPDFs.length > 0) ? (
          relevantPDFs.map((doc: any) => (
            <a href={doc.metadata.hyperlink} target="_blank">
              <Card>
                <CardHeader>
                  <CardTitle className="font-normal">{doc.metadata.directory}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <Label className="font-bold">URL:</Label>
                    <output>{doc.metadata.hyperlink}</output>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Abstract</Label>
                    <output>{doc.metadata.text}</output>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        ) : (
          <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            No Documents Available...
          </Label>
        )}
      </Card>
    </div>
  );
}
  
  export default SearchPage;
  