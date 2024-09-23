"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";

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
import Link from "next/link";
import InputFormField from "@/components/Auth/InputFormField";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase/firebase";
import Image from "next/image";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/page-title";

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
    reValidateMode: "onSubmit",
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

      // Sign In With Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.push("/chat");
    } catch (error: unknown) {
      form.setError("email", {
        type: "manual",
        message: "Invalid email or password",
      });
      form.setError("password", {
        type: "manual",
        message: "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="w-full">
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(handleLogin)}
          className="h-full flex justify-center"
        >
          <div className="w-full max-w-[460px] flex flex-col justify-start mt-[100px] gap-5">
            <div>
              <PageTitle className="text-center font-bold text-[3rem]">
                Welcome Back
              </PageTitle>
            </div>

            {/* Email */}
            <InputFormField
              form={form}
              label="Email"
              name="email"
              type="email"
            />

            <div className="flex flex-col gap-1">
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
              <Link
                href="/reset-password"
                className="text-xs ml-auto hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              className="bg-primaryHue hover:bg-primaryHue/90 disabled:opacity-[0.6]"
              disabled={isLoading}
            >
              Log In
            </Button>

            <Label className="text-center">
              Don't have an account?{" "}
              <Link
                href={"/signup"}
                className="underline font-bold hover:opacity-[0.8]"
              >
                Sign Up
              </Link>
            </Label>
          </div>

          {/* Info Alert */}
          <AlertDialog open={!!alert}>
            <AlertDialogTitle className="hidden"></AlertDialogTitle>
            <AlertDialogContent
              onOpenAutoFocus={(e: any) => e.preventDefault()}
            >
              <AlertDialogDescription className="text-base text-[black]">
                {alert}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => setAlert("")}
                  className="bg-primaryHue hover:bg-primaryHue/90"
                >
                  Okay
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </Form>
    </Container>
  );
}
