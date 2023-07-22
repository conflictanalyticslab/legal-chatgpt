import React from "react";
import Hero from "./landing/Hero"
import Header from "./landing/Header"
import Footer from "./landing/Footer"
import WebFont from "webfontloader";

WebFont.load({google: {families: ["Roboto:300,400,500"]}});
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider} from '@mui/material/styles';

const theme = createTheme({
    typography: {
      fontFamily: [
        'Roboto',
        'sans-serif',
      ].join(','),
    },});

function LandingPage() {
  
    return (
      <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Hero />
        <Footer />    
        </ThemeProvider>
      </>
  
    );
  }

export default LandingPage;
