"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

import { useForm, SubmitHandler } from "react-hook-form";
import { getDatabase, ref, child, get } from "firebase/database";
import { loginSchema } from "@/models/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAlert, alert } = useChatContext();
  const router = useRouter();

  const form = useForm<Zod.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

  const handleLogin: SubmitHandler<Zod.infer<typeof loginSchema>> = async ({
    email,
    password,
  }: Zod.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);

      // Form validation
      loginSchema.parse({
        email,
        password,
      });

      // Read white list emails
      // const whiteListEmails: string[] =
      //   (await readWhitelistEmails()) as string[];

      // if (!whiteListEmails.includes(email)) {
      //   throw new Error("Account not on the white list emails");
      // }

      // Sign In With Firebase
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          router.push("/chat");
        })
        .catch((error: any) => {
          console.log(error);
          form.setError("email", {
            type: "manual",
            message: "Invalid email or password",
          });
          form.setError("password", {
            type: "manual",
            message: "Invalid email or password",
          });
        });
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) setAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleLogin)}
        className="h-full flex justify-center"
      >
        <div className="min-w-[300px] flex flex-col justify-start mt-[100px] gap-5">
          <h1 className="text-center font-bold text-[2rem]">Login</h1>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Email</FormLabel>
                <div>
                  <FormControl>
                    <Input
                      className="ring-0 focus:ring-0"
                      placeholder="Email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="mt-0" />
                </div>
              </FormItem>
            )}
          />

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
                        className="ring-0 focus:ring-0 pr-[2.5rem]"
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

          <Button
            className="bg-primaryOJ hover:bg-primaryOJ/90 disabled:opacity-[0.6]"
            disabled={isLoading}
          >
            Login
          </Button>
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
