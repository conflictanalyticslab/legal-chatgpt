import { auth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export const resetPassword = async (email: string) => {
  try {
    sendPasswordResetEmail(auth, email);
    return true;
  } catch (e) {
    return e;
  }
};
