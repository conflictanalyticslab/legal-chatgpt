import { auth } from "@/lib/firebase/firebase-admin/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export const resetPassword = async (email: string = "") => {
  try {
    sendPasswordResetEmail(auth, email);
    return true;
  } catch (e) {
    return e;
  }
};
