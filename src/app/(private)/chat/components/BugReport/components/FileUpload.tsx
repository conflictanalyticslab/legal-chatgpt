import React from "react"
import Dropzone, { DropEvent, FileRejection } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { FileUp } from "lucide-react"
import { cn } from "@/utils/utils"

export default function FileUpload({
	onDrop,
	text,
	className,
}: {
	onDrop?:
		| (<T extends File>(
				acceptedFiles: T[],
				fileRejections: FileRejection[],
				event: DropEvent
		  ) => void)
		| undefined,
	text: string, 
	className: string,
}) {
	return (
    <Dropzone onDrop={onDrop}>
      {({ getRootProps, getInputProps }) => (
        <div
          className={cn(
            "px-cmd py-clg flex flex-col items-center justify-center gap-cxs border-2 border-border border-dashed rounded-md bg-muted hover:cursor-pointer",
            className
          )}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <Button
            className="bg-transparent pointer-events-none"
            size="icon"
            variant="ghost"
            asChild
          >
            <FileUp className="h-5 w-5 stroke-muted-foreground" />
          </Button>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">{text}</p>
          </div>
        </div>
      )}
    </Dropzone>
  );
}
