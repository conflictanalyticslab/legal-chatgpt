import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import GPT4Tokenizer from 'gpt4-tokenizer';
import { newDocument } from "@/lib/firebase/client/new-document";
import { authenticateApiUser } from "@/lib/middleware/authenticate-api-user";

// Get all documents owned by the user in the authentication header
export async function GET(_: Request) {
  const { decodedToken } = await authenticateApiUser();

  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  const queryResults = await getFirestore()
    .collection("documents")
    .where("userUid", "==", decodedToken.user_id)
    .get();

  const plainJsObjects = queryResults.docs.map((doc) => {
    const data = doc.data();
    return { ...data, uid: doc.id };
  });

  return NextResponse.json({ documents: plainJsObjects }, { status: 200 });
}

// Upload a document
// This endpoint requires Node v20 or later
// If this is failing locally, check your node version by running `node -v` in the terminal
export async function POST(req: Request) {
  const { decodedToken } = await authenticateApiUser();

  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  const data = await req.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "File is missing" }, { status: 400 });
  }

  // Set the maximum file size to 5 MB (5 * 1024 * 1024 bytes)
  const maxSizeInBytes = 5 * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return NextResponse.json(
      {
        error:
          "File exceeds the maximum allowed size (5MB) Yours is " +
          file.size / 1024 / 1024 +
          " megabytes",
      },
      { status: 400 }
    );
  }


  const rawFile = await file.arrayBuffer();
  const decoder = new TextDecoder("utf8");
  const docText = decoder.decode(rawFile);

  const tokenizer = new GPT4Tokenizer({ type: 'gpt3' }); // or 'codex'
  const estimatedTokenCount = tokenizer.estimateTokenCount(docText);

  if (estimatedTokenCount > 16384) {
    return NextResponse.json(
      {
        error:
          "File is too long. We limit files to  including spaces. Yours is " +
          docText.length +
          " characters.",
      },
      { status: 413 }
    );
  }


  const newDoc = await newDocument(docText, file.name, decodedToken.user_id);

  return NextResponse.json(newDoc, { status: 200 });
}
