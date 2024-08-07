import { auth } from "@/firebase";

export async function uploadPdfDocument(file: {
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
      throw new Error("PDF token limit exceeded");
    } else if (res.status === 400) {
      throw new Error("PDF file too large");
    }
    console.error(`Error! status: ${res.status} ${errorData.error}`);
  }

  return res.json();
}
