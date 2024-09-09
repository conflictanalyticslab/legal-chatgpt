import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { auth, db } from "@/lib/firebase/firebase";
import { userConverter } from "@/models/User";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

export function useGetAuthenticatedUser() {
  const { setUser, setAlert } = useChatContext();
  const router = useRouter();

  const getAuthenticatedUser = async (user: any) => {
    try {
      console.log("user uid", user.uid)
      const docRef = doc(db, "users", user.uid).withConverter(userConverter);

      const docSnap = await getDoc(docRef);
      console.log("this is the snap", docSnap.data())
      if (docSnap.exists()) {
        if (docSnap.data().verified) {
          console.log(docSnap.data());
          setUser(docSnap.data());
          setAlert("");
        }
      } else {
        router.push("/login");
      }
    } catch (e: unknown) {
      router.push("/login");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("here")
      console.log("bruh", user)
      if (user) {
        // Auth state resolved, user is signed in
        getAuthenticatedUser(user);
      } else {
        console.log("here", user)
        // Auth state resolved, but no user signed in
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

}
