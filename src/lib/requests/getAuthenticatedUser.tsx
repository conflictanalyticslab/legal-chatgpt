import { auth, db } from "@/lib/firebase/firebase";
import { userConverter, UserI } from "@/models/User";
import { FirebaseError } from "firebase/app";
import { getDoc, doc } from "firebase/firestore";

export async function getAuthenticatedUser(): Promise<UserI | null> {
  const userDataPromise = async () => {
    console.log("Authenticating user info...");

    if (!auth.currentUser) {
      throw new FirebaseError("400", "User is not signed in");
    } else {
      const docRef = doc(db, "users", auth.currentUser.uid).withConverter(
        userConverter
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        if (docSnap.data().verified) return docSnap.data();
      }
      return null;
    }
  };

  var i = 0;
  var max = 5;
  while (i < max) {
    try {
      return await userDataPromise();
    } catch (e) {
      i += 1;
      // Wait one second before next attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Could not load the user after " + max + " tries");
}
