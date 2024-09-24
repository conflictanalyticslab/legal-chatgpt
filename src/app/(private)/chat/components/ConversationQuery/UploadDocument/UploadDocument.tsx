import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { Paperclip } from "lucide-react";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import GPT4Tokenizer from "gpt4-tokenizer";
import { cn } from "@/utils/utils";
import { postPDF } from "@/lib/requests/postPDF";
import { uploadPdfDocument } from "@/lib/requests/uploadPdfDocument";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function UploadDocument() {
  const {
    setInfoAlert,
    documents,
    setDocuments,
    includedDocuments,
    setIncludedDocuments,
    setDocumentContent,
    loadingPDF,
    setLoadingPDF,
  } = useChatContext();

  const { openFilePicker } = useFilePicker({
    accept: ".pdf",
    readAs: "ArrayBuffer", // ArrayBuffer takes exactly as much space as the original file. DataURL, the default, would make it bigger.
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({
        maxFileSize: 5 * 1024 * 1024 /* 5 megabytes */,
      }),
    ],
    onFilesSelected: () => {
      setLoadingPDF(true);
    },
    onFilesRejected: ({ errors }) => {
      setInfoAlert("File is too big. We have a 5 Mb limit.");
      setLoadingPDF(false);
    },
    onFilesSuccessfullySelected: async ({ plainFiles }: any) => {
      filesSuccessfullyUploaded(plainFiles);
    },
  });

  function handleUploadFile() {
    if (loadingPDF) return;
    openFilePicker();
  }

  async function filesSuccessfullyUploaded(plainFiles: any) {
    // this callback is called when there were no validation errors
    let estimatedTokenCount = -1;
    let pdfFileSize = -1;

    try {
      const pdfContent = await postPDF(plainFiles[0]); // Call the PDF processor api-end point to parse the pdf content

      // PDF file size check
      pdfFileSize = plainFiles[0].size;
      if (pdfFileSize > 5 * 1024 * 1024) {
        throw new Error("PDF File uploaded too large");
      }

      // PDF token count check
      const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
      estimatedTokenCount = tokenizer.estimateTokenCount(pdfContent.content);
      if (estimatedTokenCount > 16384) {
        throw new Error("PDF token limit exceeded");
      }

      // Add to the list of pdf content and add the document to the list of included documents
      setDocumentContent(pdfContent.content);
      const newDoc = await uploadPdfDocument({
        content: pdfContent.content,
        name: plainFiles[0].name,
      });

      // Add the documents to the list of uploaded documents
      setDocuments([...documents, newDoc]);
      setIncludedDocuments([...includedDocuments, newDoc.uid]);

      toast({
        title: "PDF uploaded successfully!",
      });

      setLoadingPDF(false);
    } catch (err: Error | any) {
      if (err.message === "PDF File uploaded too large") {
        toast({
          title:
            "The PDF file uploaded is too large, maximum of 5MB expected, your pdf is ' + pdfFileSize/(1024*1024) + ' bytes!",
          variant: "destructive",
        });
      } else if (
        err.message === "PDF token limit exceeded" &&
        estimatedTokenCount !== -1
      ) {
        toast({
          title:
            "The PDF file uploaded exceeds limit, maximum of 8192 token in each PDF uploaded, your pdf contains ' + estimatedTokenCount + ' tokens",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingPDF(false);
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "hover:bg-transparent bg-[transparent] md:px-4 md:absolute left-[-70px] transition-all self-center",
              {
                "opacity-[0.5] cursor-not-allowed": loadingPDF,
              }
            )}
            type="button"
            aria-label="Attach PDF"
            onClick={handleUploadFile}
          >
            {loadingPDF ? (
              <LoadingSpinner />
            ) : (
              <Paperclip className="w-3 md:w-5 h-3 md:h-5 rotate-[-45deg]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload document for the LLM to use</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
