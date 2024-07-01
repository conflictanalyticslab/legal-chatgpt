"use client";
import { AppBackground, GridContainer } from "@/styles/styles";
import { resetPassword } from "@/util/api/firebase_utils/auth";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { validEmailRegex } from "@/util/signup/validEmailRegex";
import { Button } from "@/components/ui/button";

function page() {
  const [email, setEmail] = useState("");
  const [emailHelper, setEmailHelper] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const Joi = require("joi");

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .pattern(validEmailRegex)
      .messages({
        "string.pattern.base": "Valid email must be entered.",
      }),
  });

  const handleResetPassword = async () => {
    try {
      setLoading(true); //Used to disable rest password button

      // Do input validation for email
      const value = emailSchema.validate(
        { email: email },
        { abortEarly: false }
      );
      if (value.error) {
        setEmailHelper("Invalid Email Entry");
        setEmailError(true);
        setLoading(false);
        return;
      }

      //   Call Firebase to reset password
      await resetPassword(email);
      setPasswordResetSuccess(true);
      setLoading(false);
    } catch (e) {
      const errorCode = e;
      setEmailError(true);
    }
  };

  const handleEmail = (value: string) => {
    setEmail(value);
    setEmailError(false);
  };

  return (
    <AppBackground>
      <div className="h-full items-center justify-center flex-col flex pt-[40px] pb-[80px] min-w-[300px]">
        <div className="relative flex flex-col items-center gap-[30px]">
          <div>
            <Typography variant="h3" fontWeight={700} textAlign="center">
              Reset Password
            </Typography>
            <p style={{ color: "rgba(0, 0, 0, 0.6)" }} className="text-center">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <FormControl>
            {/* Email Input */}
            <TextField
              id="email-input"
              label="Email"
              onChange={(e) => handleEmail(e.target.value)}
              value={email}
              style={{ maxWidth: "300px", width: "100%", minWidth: "300px" }}
            />

            {/* Invalid Email Error */}
            {emailError && (
              <FormHelperText style={{ textAlign: "center" }} error={true}>
                {emailHelper}
              </FormHelperText>
            )}

            {/* Reset Password Button */}
            {!passwordResetSuccess ? (
              <Button
                type="submit"
                onClick={handleResetPassword}
                disabled={loading}
                className="mt-[20px]"
              >
                Reset Password
              </Button>
            ) : (
              // Success Message
              <FormLabel
                style={{
                  color: "#67A55A",
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                Password reset link sent to your email.
              </FormLabel>
            )}
          </FormControl>
        </div>
      </div>
    </AppBackground>
  );
}

export default page;
