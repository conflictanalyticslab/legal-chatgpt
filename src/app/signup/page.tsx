"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Typography, Box } from "@mui/material";

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
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";

import { getDatabase, ref, child, get } from "firebase/database";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import { validEmailRegex } from "@/util/signup/validEmailRegex";

export default function Signup() {
  const Joi = require("joi");
  const router = useRouter();

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .pattern(validEmailRegex)
      .messages({
        "string.pattern.base":
          "Your email is not approved for access. See the link above for a list of approved institutional emails",
      }),

    password: Joi.string().messages({
      "string.pattern.base": "Please choose a stronger password",
    }),
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: any) => {
    event.preventDefault();
  };

  const [email, setEmail] = useState("");

  const [emailHelper, setEmailHelper] = useState(
    "Please use an approved email. For access, please contact us for assistance."
  );

  const [passHelper, setPassHelper] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [generalHelper, setGeneralHelper] = useState("");

  const readWhitelistEmails = async () => {
    return new Promise((resolve) => {
      const dbRef = ref(getDatabase());
      get(child(dbRef, `whitelist-emails`))
        .then((snapshot: { exists: () => any; val: () => unknown }) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            console.log("No whitelist email available");
            resolve("No white list email available");
          }
        })
        .catch((error: any) => {
          console.error(error);
          resolve(error);
        });
    });
  };

  const validateUser = async () => {
    setEmailError(false);
    setEmailHelper(
      "Please use an institutional email. For access, please contact us for assistance."
      // "Your email is not approved for access. See here for a list of approved institutional emails"
    );
    setPasswordError(false);
    setPassHelper("");

    try {
      const value = emailSchema.validate(
        { email: email, password: password },
        { abortEarly: false }
      );
      // console.log(value);
      if (value.error) {
        setEmailHelper("Checking your email...");
        setEmailError(false);

        for (let msg of value.error.details) {
          if (msg.context.key == "email") {
            // check if email is in white list and return right away
            console.log("Accessing whitelist emails on Firebase");

            readWhitelistEmails().then((whiteListEmails: any) => {
              if (whiteListEmails.includes(email)) {
                console.log("Email is in whitelist");
                setEmailError(false);
                setEmailHelper("");
              } else {
                setEmailHelper(msg.message);
                setEmailError(true);
              }
            });

            // setGeneralHelper("");
            // console.log(whiteListEmails);
            // console.log(email);
          } else if (msg.context.key == "password") {
            setPassHelper(msg.message);
            setPasswordError(true);
          }
        }
      }
    } catch (err: any) {
      console.log(err);
      setGeneralError(err);
    }

    return emailError || passwordError;
  };

  const handleSignup = async (event: any) => {
    event.preventDefault();

    const errors = await validateUser();
    console.log(errors);
    if (!errors) {
      const userSignupRes = await fetch("/api/user/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (userSignupRes.status === 403) {
        setEmailError(true);
        setEmailHelper(
          "Please use an institutional email. For access, please contact us for assistance."
        );
      } else if (userSignupRes.status === 400) {
        const { error }: { error: string } = await userSignupRes.json();
        if (error.includes("email")) {
          setEmailError(true);
          setEmailHelper(error);
        } else {
          setPasswordError(true);
          setPassHelper(error);
        }
      } else {
        console.log("Successfully registered! Signing in...");
        handleSignin(event);
      }
    }
  };

  const handleSignin = async (event: any) => {
    event.preventDefault();

    const errors = await validateUser();
    console.log(errors);
    if (!errors) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          router.push("/chat");
        })
        .catch((error: any) => {
          const errorMessage = error.message;
          console.log(error.code);
          setGeneralError(errorMessage);
        });
    }
  };

  return (
    <AppBackground>
      <div className="min-w-[300px] min-h-[100%] pt-[40px] pb-[80px]">
        <div style={{ marginBottom: "24px" }}>
          <Typography variant="h3" fontWeight={700} textAlign="center">
            Create an account
          </Typography>
          <Typography
            variant="h6"
            fontWeight={700}
            textAlign="center"
            color="#11335D"
            className="px-[20px]"
>
            with an email from{" "}
            <a href="/institutionsList">approved institutions</a>
          </Typography>
        </div>

        <div style={{ alignItems: "center" }}>
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
                maxWidth: "500px",
                textAlign: "center",
                margin: "auto",
              }}
            >
              <TextField
                id="email-input"
                label="Email"
                helperText={emailHelper}
                value={email}
                error={emailError}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "300px" }}
              />
              <FormControl sx={{ m: 1, width: "300px" }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">
                  Password
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  value={password}
                  error={passwordError}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FormHelperText error={passwordError}>
                  {passHelper}
                </FormHelperText>
                <Button
                  type="submit"
                  onClick={handleSignup}
                  className="mt-[20px]"
                >
                  Sign up
                </Button>
              </FormControl>
              <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                {"Register your email with our"}&nbsp;
                <a
                  // onClick={handleSignup}
                  href="/waitlist"
                  style={{ textDecoration: "underline", fontWeight: "bold" }}
                >
                  waitlist
                </a>
              </div>
              <FormHelperText error={Boolean(generalError)}>
                {generalHelper}
              </FormHelperText>
            </div>
          </Box>
        </div>
        <Grid item xs={12} md={7} margin="0px" width="90%"></Grid>
      </div>
    </AppBackground>
  );
}
