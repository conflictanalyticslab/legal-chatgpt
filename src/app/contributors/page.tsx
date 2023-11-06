"use client";

import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import React, { useState } from "react";
import { Typography } from "@mui/material";
import Image from "next/image";
import Grid from "@mui/material";
import UCLALaw from "../../images/contributorsLogo/UCLALaw.jpeg";
import NorthWesternLaw from "../../images/contributorsLogo/NorthWesternLaw.jpeg";
import WisconsinLaw from "../../images/contributorsLogo/WisconsinLaw.webp";
import CornellLaw from "../../images/contributorsLogo/CornellLaw.jpg";
import FSULaw from "../../images/contributorsLogo/FSULaw.jpeg";
import IOWALaw from "../../images/contributorsLogo/IOWALaw.jpeg";
import PennCareyLaw from "../../images/contributorsLogo/PennCareyLaw.webp";
import HarvardLaw from "../../images/contributorsLogo/HarvardLaw.png";
import QueensLaw from "../../images/contributorsLogo/QueensLaw.jpeg";
import UTorontoLaw from "../../images/contributorsLogo/UTorontoLaw.png";
import McGillLaw from "../../images/contributorsLogo/McgillLaw.png";
import UManitobaLaw from "../../images/contributorsLogo/UManitobaLaw.jpg";
import UCalgaryLaw from "../../images/contributorsLogo/UCalgaryLaw.png";
import IELaw from "../../images/contributorsLogo/IELaw.webp";
import ULille from "../../images/contributorsLogo/ULille.png";
import Dauphine from "../../images/contributorsLogo/Dauphine.png";
import ULeiden from "../../images/contributorsLogo/ULeiden.png";


export default function Contributors() {

    const images = require.context('../../images', true);
    const imageList = images.keys().map(image => images(image));

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
            <div style={{ marginTop: "5vh", marginBottom: "24px", width: '60%'}}>
                <Typography variant="h3" fontWeight={700} textAlign="center">
                    Contributors
                </Typography>
                <Typography
                variant="body1"
                sx={{ marginTop: "30px", fontSize: "20px", textAlign: "left" }}
                >
                    OpenJustice is currently accessible to more than 15 schools in North America and Europe. We are striving to make OpenJustice available to a greater number of organizations.
                </Typography>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
                <div style={{ width: '30%', paddingRight: '2rem'}}> 
                    <Typography variant="h4" fontWeight={700} textAlign='center'>US</Typography>
                    <Image src={UCLALaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={NorthWesternLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={WisconsinLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={CornellLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={FSULaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={HarvardLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={IOWALaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={PennCareyLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                </div>

                <div style={{ width: '30%', paddingRight: '2rem'}}> 
                    <Typography variant="h4" fontWeight={700} textAlign='center'>Canada</Typography>
                    <Image src={QueensLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={UTorontoLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={McGillLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={UManitobaLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={UCalgaryLaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                </div>

                <div style={{ width: '30%'}}> 
                    <Typography variant="h4" fontWeight={700} textAlign='center'>Europe</Typography>
                    <Image src={ULeiden} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={IELaw} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={ULille} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                    <Image src={Dauphine} style={{paddingRight:'0.5rem', marginBottom: '0.5rem', maxHeight:'5rem', width: 'auto'}}></Image>
                </div>
            </div>

        </GridContainer>
      </HeroBox>
    </AppBackground>
    );
}

function importAll<T>(arg0: any) {
    throw new Error("Function not implemented.");
}
