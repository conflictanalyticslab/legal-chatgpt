import { auth } from "@/lib/firebase/firebase";

export type UserDocument = {
  uid: string;
  name: string;
  text: string;
  userUid: string;
};

export async function getDocumentsOwnedByUser(): Promise<UserDocument[]> {
  if (!auth.currentUser) return [];


  const res = await fetch(`/api/user/document`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
  });

  if (!res || !res.ok)
    throw new Error("Couldn't fetch documents owned by user.");

  const { documents } = await res.json();
  return documents;
}
