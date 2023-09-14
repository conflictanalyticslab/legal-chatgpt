import { auth } from "@/firebase";

export async function uploadPdfDocument(file: {
  content: string;
  name: string;
}) {
  const formData = new FormData();
  const blob = new Blob([file.content], { type: "application/pdf" });
  formData.append("file", blob, file.name);

  return await fetch("/api/user/document", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: formData,
  });
}
