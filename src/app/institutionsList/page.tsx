"use client";

import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import { Box, FormHelperText, List, ListItem, ListItemText, Typography } from "@mui/material";
import React, { useState } from "react";

export default function InstitutionsList() {
    const institutions = [
        { id: 1, name: "Queen's University (@queensu.ca)"},
        { id: 2, name: "University of Iowa (@uiowa.edu)"},
        { id: 3, name: "University of Portsmouth (@port.ac.uk)"},
        { id: 4, name: "UCLA School of Law (@law.ucla.edu)"},
        { id: 5, name: "University of Pennsylvania Carey Law School (@law.upenn.edu)"},
        { id: 6, name: "Lakehead University (@lakeheadu.ca)"},
        { id: 7, name: "McGill University (@mcgill.ca)"},
        { id: 8, name: "University of Alberta (@ualberta.ca)"},
        { id: 9, name: "University of Calgary (@ucalgary.ca)"},
        { id: 10, name: "University of Manitoba (@umanitoba.ca)"},
        { id: 10, name: "University of Toronto (@utoronto.ca)"},
        { id: 11, name: "Florida State University of Law (@law.fsu.edu)"},
        { id: 12, name: "Leiden Law School (@law.leidenuniv.nl)"},
        { id: 13, name: "Leiden University Libraries (@library.leidenuniv.nl)"},
        { id: 14, name: "Université Catholique de Lille (@univ-vatholille.fr)"},
        { id: 15, name: "Harvard Law School (@law.harvard.edu)"},
        { id: 16, name: "Harvard Faculty of Arts and Sciences (@fas.harvard.edu)"},
        { id: 17, name: "Northwestern Pritzker School of Law (@law.northwestern.edu)"},
        { id: 18, name: "Northwestern Kellogg School of Management (@kellogg.northwestern.edu)"}
    ];

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
          <div style={{ marginTop: "5vh", marginBottom: "24px" }}>
            <Typography variant="h4" fontWeight={700} textAlign="center">
                List of pre-approved institutional domains
            </Typography>
            <div style={{alignItems: 'center'}}>
                <List>
                    {institutions.map((institution) => (
                        <ListItem key={institution.id}> 
                            <ListItemText primary={institution.name}/>
                        </ListItem>
                    ))}
                </List>
            </div>
          </div>

          <div style={{ width: "40%", alignItems: "center" }}>
          </div>
        </GridContainer>
      </HeroBox>
    </AppBackground>
    );
}
