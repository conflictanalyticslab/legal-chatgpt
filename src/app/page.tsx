import React from "react";
import Image from "next/image";
import { Grid, Typography, Button, Box, Container } from "@mui/material";
import mid_logo from "@/images/OpenMiddleLogo.png";
import leftRight from "@/images/LandingBackground.png";
import { PublicShell } from "@/components/PublicShell/PublicShell";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
// import MainpageVid from "@/images/MainPageVid.mp4";

export default function Home() {
  return (
    <PublicShell>
      <Hero />
    </PublicShell>
  );
}

function Hero() {
  return (
    <AppBackground
      style={{
        backgroundImage: `url('${leftRight.src}')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }}
    >
      <HeroBox textAlign="center">
        <GridContainer
          container
          spacing={0}
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Grid item xs={12} md={7}>
            <Image
              src={mid_logo}
              alt="OpenJustice logo"
              style={{
                marginTop: "120px",
                alignItems: "center",
              }}
            />
          </Grid>
          <Grid item xs={12} md={7} width="40%" sx={{ paddingBottom: "20px" }}>
            <Typography
              variant="h1"
              fontWeight={700}
              textAlign="center"
              sx={{ paddingBottom: "5px", fontSize: "2.125rem" }}
            >
              {/* \u00A0 is a non breaking space so text is all on one line but if we need to
                  we will split the text between the word AI and Designed */}
              {"Generative\u00A0AI Designed\u00A0for\u00A0Law"}
              {/* {"is\u00A0currently\u00A0down! We\u00A0are\u00A0implementing\u00A0new\u00A0features"} */}
            </Typography>
            <Typography
              variant="body1"
              sx={{ marginTop: "30px", fontSize: "20px", textAlign: "left" }}
            >
               Our mission is to make legal AI technology accessible and dependable. Built on state-of-the-art language models fine-tuned for law, OpenJustice can address complex legal queries and process and analyze legal documents. Drawing upon vast legal sources and narratives, OpenJustice aims to provide exhaustive and accurate responses and equip law students and lawyers with innovative research tools. As a continuously learning and evolving research prototype, we actively seek your input to improve the quality of our responses and ensure the dependability of OpenJustice
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                href="/login"
                variant="contained"
                sx={{
                  width: "160px",
                  fontSize: "16px",
                  marginTop: "30px",
                  color: "black",
                  textTransform: "none",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Get Started
              </Button>
            </Box>
          </Grid>
          <Grid style={{display: 'flex', gap: '3rem', paddingTop: '1rem'}}>
          <Typography variant="h4"> Expert-led </Typography>
          <Typography variant="h4"> Non-Profit </Typography>
          <Typography variant="h4"> Open-source</Typography>
          <Typography variant="h4"> Independent </Typography>
          </Grid>
          <div style={{marginTop: "50px", marginBottom: "50px"}}>
          <iframe src="https://www.youtube.com/embed/pmF9FYCWT5A?rel=0" width="640" height="360" scrolling="no" title="Conflict Analytics OpenJustice Demo FINAL.mp4"></iframe>
          </div>
        </GridContainer>
      </HeroBox>
    </AppBackground>
  );
}
