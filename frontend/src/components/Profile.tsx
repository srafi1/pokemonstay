import React from 'react';
import { Box, Button, ThemeProvider, Typography } from '@material-ui/core';
import theme from '../common/theme';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Profile() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor="background.default"
        color="text.primary"
        height={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <img src={logo} width={600} alt="Pokemon Stay" />
        <Typography variant="h3">
          profile page
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          component={Link}
          to="/login">
          Get Started
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default Profile;
