import { auth } from "@/firebase";

export async function uploadPdfDocument(file: {
  // content: ArrayBuffer;
  content: string;
  name: string;
}) {
  const formData = new FormData();
  const blob = new Blob([file.content], { type: "application/pdf" });
  formData.append("file", blob, file.name);

  const res = await fetch("/api/user/document", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 413) {
      throw new Error("PDF File uploaded too large");
    }
    console.error(`Error! status: ${res.status} ${errorData.error}`);
  }

  return res.json();
}
