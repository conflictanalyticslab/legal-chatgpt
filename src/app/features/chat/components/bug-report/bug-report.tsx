import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Bug, Trash } from 'lucide-react';
import React, { useState } from 'react'
import FileUpload from '../file-upload/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from '@/components/ui/label';

export default function BugReport() {
  const [file, setFile] = useState<any>(null)

  const formSchema = z.object({
    bugReportTitle: z.string().min(0, {
      message: "Please enter bug report title",
    }).optional(),
    bugReportDescription: z.string().min(0, {
      message: "Please enter bug report description",
    }).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bugReportTitle: '', 
      bugReportDescription: ''
    },
  })


  const onsubmit = async (formValues: z.infer<typeof formSchema>) => {
    //Write your business logic here
    // console.log(formValues);
    // console.log(file)
  };

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Bug className="w-5 h-5" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a Bug</DialogTitle>
          </DialogHeader>

          {/* File Upload */}
          <FileUpload
            className="min-h-[100px]"
            text="Upload Screenshot"
            onDrop={(file: any) => {
              if (file) setFile(file[0]);
            }}
          />

          {file && (
            <div className="flex items-center gap-x-3">
              <Label>{file?.name}</Label>
              <Button
                variant={"destructive"}
                onClick={() => setFile(null)}
                className=" p-0 h-[28px] w-[28px]"
              >
                <Trash className='h-3'/>
              </Button>
            </div>
          )}

          <Form {...form}>
            <form
              className="flex flex-col gap-8"
              onSubmit={form.handleSubmit(onsubmit)}
            >
              {/* Bug Report Title */}
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="bugReportTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Bug Description Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bug Report Description  */}
                <FormField
                  control={form.control}
                  name="bugReportDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how to reproduce the bug..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Send Bug Report</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
