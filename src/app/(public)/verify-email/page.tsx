"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useForm, SubmitHandler } from "react-hook-form";
import { getDatabase, ref, child, get } from "firebase/database";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/page-title";
import { toast } from "@/components/ui/use-toast";
import { verifyEmailSchema } from "@/app/features/verify-email/models/schema";
import InputFormField from "@/components/auth/input-form-field";
import { useGlobalContext } from "@/app/store/global-context";

export default function Login() {
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAlert, alert } = useGlobalContext();
  const router = useRouter();

  const form = useForm<Zod.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
    },
    reValidateMode: "onSubmit",
  });

  const handleLogin: SubmitHandler<
    Zod.infer<typeof verifyEmailSchema>
  > = async ({ email }: Zod.infer<typeof verifyEmailSchema>) => {
    try {
      // Form validation
      verifyEmailSchema.parse({
        email,
      });

      
    } catch (error: unknown) {
      // form.setError("email", {
      //   type: "manual",
      //   message: "Invalid email or password",
      // });
    } finally {
    }
  };

  return (
    <Container className="w-full h-[calc(100%-50px-75px)]">
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(handleLogin)}
          className="h-full flex justify-center"
        >
          <div className="w-full max-w-[460px] flex flex-col justify-start mt-[100px] gap-5">
            <div>
              <PageTitle className="text-center font-bold heading">
                Send Verification Email
              </PageTitle>
            </div>

            {/* Email */}
            <InputFormField
              form={form}
              label="Email"
              name="email"
              type="email"
            />

            <Button
              className="bg-primaryHue hover:bg-primaryHue/90 disabled:opacity-[0.6]"
              disabled={isLoading}
            >
              Send Verification
            </Button>

            <Label className="text-center">
              Already verified?{" "}
              <Link
                href={"/login"}
                className="underline font-bold hover:opacity-[0.8]"
              >
                Log in
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
