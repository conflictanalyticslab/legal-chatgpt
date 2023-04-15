import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import useStyles from '../styles/styles';

const Footer = () => {
  const classes = useStyles();

  return (
    <Box sx={{ flexGrow: 1 }} className={classes.footerContainer}>
      <Typography className={classes.footerText}>
      © 2020
       {' '}
        <Link href="https://myopencourt.org/" target="_blank" underline="none">
        Conflict Analytics Lab
        </Link>
         . All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;