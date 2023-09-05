import { auth } from "@/firebase";

export async function postSearch(searchTerm: string) {
  return await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ searchTerm }),
  });
}
