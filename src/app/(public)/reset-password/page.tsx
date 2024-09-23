"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InputFormField from "@/components/Auth/InputFormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/models/schema";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { resetPassword } from "@/lib/api/firebase_utils/auth";
import Image from "next/image";
import Container from "@/components/ui/container";
import PageTitle from "@/components/ui/page-title";

function page() {
  const [loading, setLoading] = useState(false);
  const form = useForm<Zod.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResetPassword = async (
    formValues: Zod.infer<typeof resetPasswordSchema>
  ) => {
    try {
      setLoading(true); //Used to disable rest password button

      // Call Firebase to reset password
      await resetPassword(formValues.email);
    } catch (error: unknown) {
      // Do nothing we don't want to give any details away.
    }
  };

  if (!loading)
    return (
      <Container className="w-full">
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(handleResetPassword)}
            className="h-full flex justify-center"
          >
            <div className="w-full max-w-[460px] flex flex-col justify-start mt-[100px] gap-5">
              <div>
                <PageTitle className="text-center font-bold text-[3rem]">
                  Reset Password
                </PageTitle>
                <p className="text-center text-[#00000099]">
                  Enter your email and we'll send you a link to reset your
                  password.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {/* Email Input */}
                <InputFormField
                  form={form}
                  label=""
                  type="email"
                  name="email"
                  placeholder="Email"
                />
                <Link href="/login" className="text-xs ml-auto hover:underline">
                  Log in?
                </Link>
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                disabled={loading}
                className="bg-primaryHue hover:bg-primaryHue/90 disabled:opacity-[0.6]"
              >
                Reset Password
              </Button>
            </div>
          </form>
        </Form>
      </Container>
    );

  return (
    <Container className="flex flex-col items-center gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-center font-bold text-[3rem]">Check Your Email</h1>
        <p className="text-center text-[#00000099]">
          If you have an account with us, you should receive an email to reset
          your password.
        </p>
      </div>
      <Button asChild className="bg-primaryHue hover:bg-primaryHue/90">
        <Link href="/login" className="w-full">
          Log In
        </Link>
      </Button>
    </Container>
  );
}

export default page;
