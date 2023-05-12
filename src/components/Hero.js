import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import useStyles from '../styles/styles';
import mid_logo from '../images/OpenJustice_Middle.svg';

import left_tri from '../images/leftTriangle.svg';
import right_tri from '../images/rightTriangle.svg';
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const checkAuth = require('../auth/checkAuthMiddleware');
  
  const handleClick = () => {
    navigate("/chat");
}

  return (
    <div className={classes.appBackground}>
      {/* <Grid item xs={12} md={7} margin = '0px' >
        <img src={left_tri} alt="left_tri" className={classes.medImage} />
      </Grid>    
      <Grid item xs={12} md={7} margin = '0px'>
        <img src={right_tri} alt="right_tri" className={classes.medImage} />
      </Grid> */}
    <Box className={classes.heroBox} textAlign="center">
      <Grid container spacing={7} className={classes.gridContainer} >
      
      <Grid item xs={12} md={7} margin = '0px'>
          <img src={mid_logo} alt="logo" className={classes.medImage} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h4" fontWeight={700} className={classes.title} textAlign="center">
            Experience ChatGPT
          </Typography>
          <Typography variant="h4" fontWeight={700} className={classes.title} textAlign="center">
            Designed for Law
          </Typography>
          <Typography variant="h6" className={classes.subtitle2} sx = {{ marginTop: '60px' }}  >
              Our advanced AI algorithms are designed to streamline and optimize 
            </Typography>
            <Typography variant="h6" className={classes.subtitle}>
            legal processes, allowing you to focus on what really matters: your case.
            </Typography>
            <Typography variant="h6" className={classes.subtitle}>
              Specifically trained on actual calculations based on Canadian case law.
            </Typography>
            
            <Box className={classes.Box} sx={{ display: 'flex', justifyContent: 'center'}}>
          <Button
            onClick={handleClick}
            variant="contained"
            className={classes.formHeading}
            sx={{ width: '200px', height: '50px', fontSize: '16px', marginTop: '30px', backgroundColor: '#11335D', color: 'white',  textTransform: 'none', mr: '2px'}}
          > Get Started
          </Button>
          
          <Button
            variant=""
            className={classes.formHeading}
            sx={{ width: '160px', fontSize: '16px', marginTop: '30px', color: 'black',  textTransform: 'none',  textDecoration: 'underline', fontWeight: 'bold' }}
          >  <Typography fontWeight= 'bold'>Learn More</Typography>
  </Button>
</Box>

        </Grid>
      </Grid>
    </Box>

    </div>
  );
};

export default Hero;