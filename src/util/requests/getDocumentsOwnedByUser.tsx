import { auth } from "@/firebase";

export type UserDocument = {
  uid: string;
  name: string;
  text: string;
  uploadCompleted: boolean;
  userUid: string;
};

export async function getDocumentsOwnedByUser(): Promise<UserDocument[]> {
  if (!auth.currentUser) {
    return [];
  }

  const res = await fetch(`/api/user/document`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
  });
  const { documents } = await res.json();
  return documents;
}
