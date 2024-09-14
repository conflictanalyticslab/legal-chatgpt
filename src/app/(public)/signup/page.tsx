"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import InputFormField from "@/components/Auth/InputFormField";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/models/schema";
import { auth, db } from "@/lib/firebase/firebase";
import { errorResponse } from "@/utils/utils";
import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { getDatabase, ref, child, get } from "firebase/database";
import { z } from "zod";
import Image from "next/image";
import { createDoc } from "@/lib/firebase/crud_utils";
import { userSchema } from "@/models/UserSchema";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { setUser, isLoading } = useChatContext();
  const [alert, setAlert] = useState("");
  const router = useRouter();
  const form = useForm<Zod.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    reValidateMode: "onSubmit",
  });

  /**
   * No idea about what this does...
   * @returns
   */
  const readWhitelistEmails = async () => {
    return new Promise((resolve) => {
      const dbRef = ref(getDatabase());
      get(child(dbRef, `whitelist-emails`))
        .then((snapshot: { exists: () => any; val: () => unknown }) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            resolve("No white list email available");
          }
        })
        .catch((error: any) => {
          console.error(error);
          resolve(error);
        });
    });
  };

  /**
   *
   * @param data
   */
  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    try {
      const validData = signupSchema.parse(data);
      // const response = await readWhitelistEmails();

      createUser(validData.email, validData.password);
    } catch (error: unknown) {
      setAlert(errorResponse(error));
    }
  };

  /**
   *
   * @param email
   * @param password
   */
  const createUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Adding user to list of valid users
      const validData = userSchema.parse({
        email,
        prompts_allowed: 100,
        prompts_left: 100,
        role: "default",
        verified: true,
      });
      // Add a new document in collection "cities"
      await setDoc(doc(db, "users", userCredential.user.uid), validData);

      const user = userCredential.user;
      setUser(user);
      router.push("/chat");

      // You can perform additional actions here, like saving user data to your database
    } catch (error: unknown) {
      setAlert(errorResponse(error));
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleSignup)}
        className="h-full flex justify-center"
      >
        <div className="min-w-[300px] w-full max-w-[460px] flex flex-col justify-start mt-[100px] gap-5">
          <div>
            <Image
              src={"/assets/icons/oj-icon.svg"}
              height={50}
              width={50}
              alt="Open Justice"
              className="mx-auto mb-[50px]"
            />
            <h1 className="text-center font-bold text-[3rem]">Sign Up</h1>
          </div>

          {/* Email */}
          <InputFormField form={form} name="email" type="email" />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Password</FormLabel>
                <div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="ring-0 focus:ring-0 pr-[2.5rem] h-[50px]"
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      {showPassword ? (
                        <button
                          type="button"
                          className="absolute right-[1rem] top-[50%] translate-y-[-50%]"
                          onClick={() => setShowPassword(false)}
                        >
                          <EyeOff className="w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="absolute right-[1rem] top-[50%] translate-y-[-50%]"
                          onClick={() => setShowPassword(true)}
                        >
                          <Eye className="w-4" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-1">
            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Confirm Password</FormLabel>
                  <div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="ring-0 focus:ring-0 pr-[2.5rem] h-[50px]"
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            className="bg-primaryOJ hover:bg-primaryOJ/90 disabled:opacity-[0.6]"
            disabled={isLoading}
          >
            Sign Up
          </Button>

          <Label className="text-center">
            Already have an account?{" "}
            <Link
              href={"/login"}
              className="underline font-bold hover:opacity-[0.8]"
            >
              Log In
            </Link>
          </Label>
        </div>

        {/* Info Alert */}
        <AlertDialog open={!!alert}>
          <AlertDialogTitle className="hidden"></AlertDialogTitle>
          <AlertDialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
            <AlertDialogDescription className="text-md text-[black]">
              {alert}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setAlert("")}
                className="bg-primaryOJ hover:bg-primaryOJ/90"
              >
                Okay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}
