import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import useStyles from '../styles/styles';
import logo from '../images/OpenJustice Basic Logo.svg';


const Hero = () => {
  const classes = useStyles();

  return (
    <div className={classes.appBackground}>
    <Box className={classes.heroBox} textAlign="center">
      <Grid container spacing={7} className={classes.gridContainer} >
      <Grid item xs={12} md={7}>
          <img src={logo} alt="My Team" className={classes.medImage} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h3" fontWeight={700} className={classes.title} textAlign="center">
            Experience ChatGPT
          </Typography>
          <Typography variant="h3" fontWeight={700} className={classes.title} textAlign="center">
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