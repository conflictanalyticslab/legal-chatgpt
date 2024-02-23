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
import Link from "next/link";
import { auth } from "@/firebase";
import styles from "@/styles/ResetPassword.module.css";

import { getDatabase, ref, child, get } from "firebase/database";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import { validEmailRegex } from "@/util/signup/validEmailRegex";
import { resetPassword } from "@/util/api/firebase/auth";

export default function Login() {
  const Joi = require("joi");
  const router = useRouter();

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .pattern(validEmailRegex)
      .messages({
        "string.pattern.base": "Email must be from an approved domain.",
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
    console.log({ emailError, passwordError });

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
      <HeroBox textAlign="center">
        <GridContainer
          container
          spacing={7}
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <div style={{ marginTop: "18vh", marginBottom: "24px" }}>
            <Typography variant="h3" fontWeight={700} textAlign="center">
              Welcome back
            </Typography>
          </div>

          <div style={{ width: "40%", alignItems: "center" }}>
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

                {/* Password */}
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
                  {/* <PasswordStrengthBar password={password} /> */}
                  <FormHelperText error={passwordError}>
                    {passHelper}
                  </FormHelperText>
                  {/* Forgot Password */}
                  <Link
                    href="/resetPassword"
                    style={{
                      alignSelf: "end",
                      color: "rgba(0, 0, 0, 0.6)",
                      padding: "5px 0 0 0",
                      fontSize: "14px",
                    }}
                    className={styles.forgot_password}
                  >
                    Forgot Password
                  </Link>

                  <Button
                    type="submit"
                    onClick={handleSignin}
                    className="mt-[20px]"
                  >
                    Continue
                  </Button>
                </FormControl>

                {/* Sign Up */}
                <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                  {"Don't have an account?"}&nbsp;
                  <a
                    // onClick={handleSignup}
                    href="/signup"
                    style={{ textDecoration: "underline", fontWeight: "bold" }}
                  >
                    Sign up
                  </a>
                </div>

                {/* <div style={{ margin: 'auto', width: '350px', height: '15px', borderBottom: '2px solid #11335D', textAlign: 'center', alignItems: 'center'}}>
                  <span style={{fontSize: '20px', backgroundColor: '#F3F5F6', padding: '0 10px', fontWeight: 'bold'}}>OR</span>
              </div>

              <Button
              sx={{ width: '300px', height: '50px', fontSize: '16px', marginTop: '30px', backgroundColor: '#FFFFFF', color: 'black',  textTransform: 'none', mr: '2px', alignItems: 'center'}}
              >
                <img src={google_logo} style={{width: '14px', height: '14px', marginRight: '6px'}}/>
                Continue with Google
              </Button>
              <Button
                sx={{ alignItems: 'center', width: '300px', height: '50px', fontSize: '16px', marginTop: '30px', backgroundColor: '#FFFFFF', color: 'black',  textTransform: 'none', mr: '2px', alignItems: 'center'}}             
              >
                <img src={microsoft_logo} style={{width: '14px', height: '14px', marginRight: '6px'}}/>
                Continue with Microsoft
              </Button> */}

                <FormHelperText error={Boolean(generalError)}>
                  {generalHelper}
                </FormHelperText>
              </div>
            </Box>
          </div>
          <Grid item xs={12} md={7} margin="0px" width="90%"></Grid>
        </GridContainer>
      </HeroBox>
    </AppBackground>
  );
}
