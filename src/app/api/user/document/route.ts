import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";

// Get all documents owned by the user in the authentication header
export async function GET(_: Request) {
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) {
    return earlyResponse;
  }

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
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) {
    return earlyResponse;
  }

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

  // Set the maximum file size to 20MB (20 * 1024 * 1024 bytes)
  // The frontend has a limit of 5 Mb instead of 20 Mb because the uncompressed
  // blob is a different size
  const maxSizeInBytes = 20 * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return NextResponse.json(
      {
        error:
          "File exceeds the maximum allowed size (20MB) Yours is " +
          file.size / 1024 / 1024 +
          " megabytes",
      },
      { status: 400 }
    );
  }

  // TO DO: POST to Microsoft Azure OCR
  console.log("Test");

  return NextResponse.json({}, { status: 202 });
}
