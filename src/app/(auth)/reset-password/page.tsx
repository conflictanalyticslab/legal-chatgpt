"use client";
import { resetPassword } from "@/util/api/firebase_utils/auth";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InputFormField from "@/components/Auth/InputFormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/models/schema";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { useChatContext } from "@/app/(private)/chat/store/ChatContext";

function page() {
  const [loading, setLoading] = useState(false);
  const { setAlert, alert } = useChatContext();
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

  return (
    <div className="h-full items-center justify-start flex-col flex mt-[100px] pb-[80px] min-w-[300px] max-w-[460px] w-full mx-auto">
      <div className="flex flex-col">
        {!loading ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleResetPassword)}
              className="flex flex-col gap-5"
            >
              <div>
                <h1 className="text-center font-bold text-[3rem]">
                  Reset Password
                </h1>
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
                className="bg-primaryOJ hover:bg-primaryOJ/90 disabled:opacity-[0.6]"
              >
                Reset Password
              </Button>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-center font-bold text-[3rem]">
                Check Your Email
              </h1>
              <p className="text-center text-[#00000099]">
                If you have an account with us, you should receive an email to
                reset your password.
              </p>
            </div>
            <Button asChild className="bg-primaryOJ hover:bg-primaryOJ/90">
              <Link href="/login" className="w-full">
                Log In
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default page;
