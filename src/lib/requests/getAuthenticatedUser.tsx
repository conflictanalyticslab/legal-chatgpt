import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { auth, db } from "@/lib/firebase/firebase";
import { userConverter } from "@/models/User";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

export function useGetAuthenticatedUser() {
  const { setUser, setAlert, setInfoAlert, setNum } = useChatContext();
  const router = useRouter();

  const getAuthenticatedUser = async (user: any) => {
    try {
      const docRef = doc(db, "users", user.uid).withConverter(userConverter);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        if (docSnap.data().verified) {
          setNum(docSnap.data().prompts_left);
          let data = { ...docSnap.data(), uid: docSnap.id };
          setUser(data);
          setAlert("");
        }
      } else {
        router.push("/login");
      }
    } catch (e: unknown) {
      setInfoAlert("User doesn't have priviledge to access chat.");
      router.push("/login");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Auth state resolved, user is signed in
        getAuthenticatedUser(user);
      } else {
        // Auth state resolved, but no user signed in
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);
}
