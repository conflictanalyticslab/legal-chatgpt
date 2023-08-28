import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import useStyles from '../../styles/styles';
import mid_logo from '../../images/OpenMiddleLogo.png';
import leftRight from '../../images/LandingBackground.png';


import { useNavigate } from "react-router-dom";
import { convertLength } from '@mui/material/styles/cssUtils';

const Hero = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  
  const handleClick = () => {
    // if user -> chat else log in
    navigate("/login");
}

  return (

    <div className={classes.appBackground} style={{ backgroundImage: `url('${leftRight}')`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center'} }>
      
    <Box className={classes.heroBox} textAlign="center">
      <Grid container spacing={0} 
        className={classes.gridContainer} 
        direction="column"
        justifyContent="center"
        alignItems="center"
        height='100%'
      >   
      
      <Grid item xs={12} md={7} maxWidth={'468'}>
          <img src={mid_logo} alt="logo" className={classes.medImage} />
        </Grid>
        <Grid item xs={12} md={7} width = '40%' sx={{paddingBottom: '20px'}}>
          <Typography variant="h4" fontWeight={700} className={classes.title} textAlign="center">
          Experience Generative AI <br /> Designed for Law
          </Typography>
          <Typography variant="h6" className={classes.subtitle2} sx = {{ marginTop: '30px', fontSize: '18px', textAlign: 'left' }}  >
          OpenJustice is an open-access AI technology designed to efficiently address legal queries and provide comprehensive answers by drawing upon diverse legal sources and narratives.
          </Typography>
            <Typography variant="h6" className={classes.subtitle} sx = {{ marginTop: '20px', fontSize: '18px', textAlign: 'left'}} >
This is a research prototype designed to help law students and lawyers to improve their legal skills. 
            </Typography>
            <Typography variant="h6" className={classes.subtitle} sx = {{ marginTop: '15px',fontSize: '18px', textAlign: 'left' }} >
OpenJustice is continuously learning and evolving. Please let us know if the answers it produces are not what you expect. 
            </Typography>
            <Box className={classes.Box} sx={{ display: 'flex', justifyContent: 'center'}}>
          <Button
            onClick={handleClick}
            variant="contained"
            className={classes.formHeading}
            sx={{ width: '200px', height: '50px', fontSize: '16px', backgroundColor: '#11335D', color: 'white',  textTransform: 'none', mr: '2px', margin: '60px'}}
          > Get Started
          </Button>
          
          <Button
            variant=""
            className={classes.formHeading}
            sx={{ width: '160px', fontSize: '16px', marginTop: '30px', color: 'black',  textTransform: 'none',  textDecoration: 'none', fontWeight: 'bold'}}
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
