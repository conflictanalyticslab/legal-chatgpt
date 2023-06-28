import React, { useState } from "react";
import { Grid, Typography, Button, Box } from '@mui/material';
import useStyles from '../../styles/styles';
import mid_logo from '../../images/OpenMiddleLogo.png';
import google_logo from '../../images/loginGoogle.png';
import microsoft_logo from '../../images/loginMicrosoft.png';

import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import { FormControl, FormLabel } from '@mui/material';

import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, deleteUser, setPersistence, browserLocalPersistence, createCustomToken } from "firebase/auth";

import { auth, db } from "../../firebase";
import { doc, setDoc, collection } from "firebase/firestore";

import User, { userConverter } from '../../styles/User';

function Login () {
  
  const Joi = require('joi');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const complexityOptions = {
      min: 5,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      requirementCount: 2,
    };

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({tlds: false})
      .pattern(/^[a-zA-Z0-9._%+-]+@queensu\.ca$/)
      .allow('openjusticedemo@gmail.com')
      .messages({
        'string.pattern.base': 'Email must be a valid queensu.ca email address.',
      }),

    password: Joi.string()
    .messages({
      'string.pattern.base': 'Please choose a stronger password',
    }),
  });


  const classes = useStyles();
  
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [email, setEmail] = useState("")
  
  const [emailHelper, setEmailHelper] = useState("Please use a queensu email")
  
  const [passHelper, setPassHelper] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [generalHelper, setGeneralHelper] = useState("")



  const validateUser = async() => {
    setEmailError(false);
      
    setEmailHelper("Please use a queensu email");
    setPasswordError(false);
    
    setPassHelper("");

    try {
        const value = await emailSchema.validate({ email: email, password: password}, {'abortEarly': false});
        if (value.error) {
          for (let msg of value.error.details) {
            // console.log(msg);
            if (msg.context.key=='email') {
                
              const err_str = msg.message;
              setEmailHelper(err_str);
              setEmailError(true);
            } else if (msg.context.key=='password') {
                
              const err_str = msg.message;
              setPassHelper(err_str);
              setPasswordError(true);
            }
          }
        }
      } catch (err) { 

          console.log(err)
          setGeneralError(err)
      }
        // console.log({emailError, passwordError})

      return (emailError || passwordError);
    }

    const saveUser = async (user) => {
      console.log('saving user')
      setSaving(true);
      try {
          //console.log(userInputs, responses);
          const user_doc = doc(db, "users", user.uid).withConverter(userConverter);
          const docRef = await setDoc(user_doc, new User(user.email, [], "default", 10, 10));
          // setAlert(
          //     `Conversation (ID: ${docRef.id}) successfully saved in Firebase.`
          // );
          // window.location.reload();
      } catch (e) {
          console.log(`Error saving user: ${e}`);
      }
      setSaving(false);
  };

  const handleSignup = async(event) => {
      event.preventDefault();

        const errors = await validateUser();
        console.log(errors);
        if (!errors) {
          
          createUserWithEmailAndPassword(auth, email, password).then(async(userCredential) => {
            // Signed in 
            const user = userCredential.user;

            const err = await saveUser(user);

            console.log('success')
            auth.updateCurrentUser(user);})
          .then(() => {
            
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            setGeneralHelper(errorMessage);
            return null;
          });

          sendEmailVerification(auth.currentUser)
          .then(setGeneralHelper("Email verification sent. Please confirm your email to finish registration"))
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            setGeneralError(errorMessage);
          });

        }
    }

    const handleSignin = async(event) => {
      event.preventDefault();
      
        const valid = await validateUser();
        console.log(valid);
        if (!valid) {
          
          signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            
          })
          .then(() => {
            navigate("/chat");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error.code);


            setGeneralError(errorMessage);
          });

          
        }
    }
    // console.log(auth.currentUser)
  return <div className={classes.appBackground}>
    <Box className={classes.heroBox} textAlign="center">
      <Grid container spacing={7} className={classes.gridContainer} 
        direction="column"
        justifyContent="center"
        alignItems="center"
        height='100%'
      >
        <div style={{marginTop: '18vh', marginBottom: '24px'}}>
          <Typography variant="h3" fontWeight={700} className={classes.title} textAlign="center">
          Welcome back
          </Typography>
        </div>

        <div style={{width: '40%', alignItems: 'center'}}>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
              alignItems: 'center',
            }}
            autoComplete="off"
          >
            <div style={{maxWidth: '500px', textAlign: 'center', margin: 'auto' }}>
              <TextField
                id="email-input"
                label="Email"
                helperText={emailHelper}
                value={email}
                error={emailError}
                onChange={e => setEmail(e.target.value)}
                style={{width: '300px'}}
              />
              <FormControl sx={{ m: 1, width: '300px' }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
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
                  onChange={e => setPassword(e.target.value)}
                />
                <FormHelperText error={passwordError}>{passHelper}</FormHelperText>
              </FormControl>
              <Button
                type="submit"
                onClick={handleSignin}
                variant="contained"
                sx={{ alignItems: 'center', width: '300px', height: '50px', fontSize: '16px', marginTop: '30px', backgroundColor: '#11335D', color: 'white',  textTransform: 'none', mr: '2px'}}
              >Continue
              </Button>
              <div style={{marginTop: '8px', marginBottom: '8px'}}>
                Don't have an account?&nbsp;
                <a onClick={handleSignup} style={{textDecoration: 'underline', fontWeight: 'bold'}}>
                   Sign up
                </a>
              </div>

              <div style={{ margin: 'auto', width: '350px', height: '15px', borderBottom: '2px solid #11335D', textAlign: 'center', alignItems: 'center'}}>
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
              </Button>

              <FormHelperText error={generalError}>{generalHelper}</FormHelperText>
            </div>
          </Box>
        </div>
        <Grid item xs={12} md={7} margin = '0px'width='90%'>
        </Grid>
      </Grid>
    </Box>


  </div>;
};

export default Login;