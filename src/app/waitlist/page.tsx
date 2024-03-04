"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Typography, Box } from "@mui/material";
import { Button } from "@/components/ui/button";
import TextField from "@mui/material/TextField";
import { FormControl } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/firebase";

import { getDatabase, ref, child, get } from "firebase/database";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import { validEmailRegex } from "@/util/signup/validEmailRegex";

export default function Signup() {
  const Joi = require("joi");
  const router = useRouter();

  const validEmailFormatRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [useCase, setUseCase] = useState("");

  const [emailHelper, setEmailHelper] = useState(
    "Please write your email is the correct format."
  );
  const [emailError, setEmailError] = useState(false);
  const [successError, setSuccessError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // do i need this?

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .pattern(validEmailFormatRegex)
      .messages({
        "string.pattern.base": "Email must have the right format",
      }),
  });

  const validateUser = async () => {
    setEmailError(false);
    setEmailHelper("Please input your email in correct format");

    try {
      const value = emailSchema.validate(
        { email: email },
        { abortEarly: false }
      );
      if (value.error) {
        setEmailHelper("Error with your email format");
        setEmailError(true);
      }
    } catch (error: any) {
      console.log(error);
      setSuccessError(error);
    }
    console.log({ emailError });

    return emailError;
  };

  const handleRegister = async (event: any) => {
    event.preventDefault();

    const errors = await validateUser();
    console.log(errors);

    if (!errors) {
      const waitlistSignup = await fetch("/api/user/waitlist", {
        method: "POST",
        body: JSON.stringify({ name, email, university, useCase }),
      });

      if (waitlistSignup.status === 400) {
        const { error }: { error: string } = await waitlistSignup.json();
        setSuccessMessage(
          "We are experiencing trouble registering your information to our waitlist"
        );
      } else {
        setSuccessMessage(
          "Successfully registered for waitlist! We will reach out with next steps"
        );
        // maybe route user back to our main page here
      }
    }
  };

  return (
    <AppBackground>
      <HeroBox textAlign="center">
        <GridContainer
          container
          spacing={7}
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
          style={{minHeight:"100vh"}}
        >
          <div style={{ marginTop: "18vh", marginBottom: "24px" }}>
            <Typography variant="h3" fontWeight={700} textAlign="center">
              Waitlist Registration
            </Typography>
          </div>

          <div>
            <Box
              component="form"
              sx={{
                "& .MuiTextField-root": { m: 1, width: "25ch" },
                alignItems: "center",
              }}
              autoComplete="off"
            >
              <div
                style={{
                  textAlign: "center",
                  margin: "auto",
                }}
                className="flex flex-col items-center"
              >
                <TextField
                  id="name-input"
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "300px" }}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  id="email-input"
                  label="Email"
                  helperText={emailHelper}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "300px" }}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  id="university-input"
                  label="University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  style={{ width: "300px" }}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  id="useCase-input"
                  label="How do you intend to use OpenJustice?"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  style={{ width: "300px" }}
                  multiline={true}
                  rows={3}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <Button
                  type="submit"
                  onClick={handleRegister}
                  className="mt-[20px] w-[100%]"
                >
                  Register to waitlist
                </Button>
                <FormHelperText
                  error={Boolean(successError)}
                  sx={{ textAlign: "center" }}
                >
                  {successMessage}
                </FormHelperText>
              </div>
            </Box>
          </div>
        </GridContainer>
      </HeroBox>
    </AppBackground>
  );
}
