"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Typography, Button, Box } from "@mui/material";

import TextField from "@mui/material/TextField";
import { FormControl } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

import { getDatabase, ref, child, get } from "firebase/database";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import User, { userConverter } from "@/util/User";

export default function Login() {
  const Joi = require("joi");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .pattern(
        /^[a-zA-Z0-9._%+-]+@(queensu\.ca|uiowa\.edu|port\.ac\.uk|law\.ucla\.edu|law\.upenn\.edu|lakeheadu\.ca|mcgill\.ca|ualberta\.ca|umanitoba\.ca|utoronto\.ca|law\.fsu\.edu|law\.leidenuniv\.nl|library\.ledidenuniv\.nl|univ\-catholille\.fr|law\.harvard\.edu|fas\.harvard\.edu|law\.northwestern\.edu|kellogg\.northwestern\.edu)$/
      )
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

  const saveUser = async (user: { email: string; uid: string }) => {
    console.log("saving user");
    setSaving(true);
    try {
      //console.log(userInputs, responses);
      const user_doc = doc(db, "users", user.uid).withConverter(userConverter);

      var valid_user = false;

      if (user.email.endsWith("queensu.ca")) {
        valid_user = true;
      }

      const docRef = await setDoc(
        user_doc,
        new User(user.email, [], "default", 10, 10, valid_user)
      );
      // setAlert(
      //     `Conversation (ID: ${docRef.id}) successfully saved in Firebase.`
      // );
      // window.location.reload();
    } catch (e) {
      console.log(`Error saving user: ${e}`);
    }
    setSaving(false);
  };

  const handleSignup = async (event: any) => {
    event.preventDefault();

    const errors = await validateUser();
    console.log(errors);
    if (!errors) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential: UserCredential) => {
          // Signed in
          const user = userCredential.user;
          if (user.email != null && user.uid != null) {
            await saveUser(user as { email: string; uid: string });
            console.log("success");
            auth.updateCurrentUser(user);
          }
        })
        .catch((error: any) => {
          const errorMessage = error.message;
          console.log(errorMessage);
          setGeneralHelper(errorMessage);
          return null;
        });

      // sendEmailVerification(auth.currentUser)
      // .then(setGeneralHelper("Email verification sent. Please confirm your email to finish registration"); )
      // .catch((error) => {
      //   const errorCode = error.code;
      //   const errorMessage = error.message;
      //   console.log(errorMessage);
      //   setGeneralError(errorMessage);
      // });
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
  // console.log(auth.currentUser)
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
                </FormControl>
                <Button
                  type="submit"
                  onClick={handleSignin}
                  variant="contained"
                  sx={{
                    alignItems: "center",
                    width: "300px",
                    height: "50px",
                    fontSize: "16px",
                    marginTop: "30px",
                    backgroundColor: "#11335D",
                    color: "white",
                    textTransform: "none",
                    mr: "2px",
                  }}
                >
                  Continue
                </Button>
                <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                  {"Don't have an account?"}&nbsp;
                  <a
                    onClick={handleSignup}
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
