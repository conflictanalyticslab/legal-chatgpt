import {
  AzureKeyCredential,
  DocumentAnalysisClient,
  FormRecognizerRequestBody,
} from "@azure/ai-form-recognizer";

export async function ocr(rawFile: FormRecognizerRequestBody) {
  const client = new DocumentAnalysisClient(
    process.env.AZURE_OCR_ENDPOINT || "",
    new AzureKeyCredential(process.env.AZURE_OCR_KEY || "")
  );

  const poller = await client.beginAnalyzeDocument("prebuilt-read", rawFile);

  const res = await poller.pollUntilDone();
  const { content } = res;
  return content;
}
