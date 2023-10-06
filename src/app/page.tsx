import React from "react";
import Image from "next/image";
import { Grid, Typography, Button, Box } from "@mui/material";
import mid_logo from "@/images/OpenMiddleLogo.png";
import leftRight from "@/images/LandingBackground.png";
import { PublicShell } from "@/components/PublicShell/PublicShell";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";

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
          <Grid item xs={12} md={7} maxWidth={"468"}>
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
              sx={{ marginTop: "30px", fontSize: "18px", textAlign: "left" }}
            >
              Our mission is to make Legal AI Dependable and Accessible.
            </Typography>
            <Typography
              variant="body1"
              sx={{ marginTop: "30px", fontSize: "18px", textAlign: "left" }}
            >
              OpenJustice is an open-access AI technology designed to
              efficiently address legal queries and provide comprehensive
              answers by drawing upon diverse legal sources and narratives.
            </Typography>
            <Typography
              variant="body1"
              sx={{ marginTop: "20px", fontSize: "18px", textAlign: "left" }}
            >
              This is a research prototype designed to help law students and
              lawyers to improve their legal skills.
            </Typography>
            <Typography
              variant="body1"
              sx={{ marginTop: "15px", fontSize: "18px", textAlign: "left" }}
            >
              OpenJustice is continuously learning and evolving. Please let us
              know if the answers it produces are not what you expect.
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
        </GridContainer>
      </HeroBox>
    </AppBackground>
  );
}
