import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { ThemeProvider } from '@material-ui/core';
import theme from '../common/theme';
import logo from '../assets/logo.png';

function Home() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{background:"#3D7DCA"}}
        height={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <img src={logo} width={600} alt="Pokemon Stay" />
        <h1 style={{fontWeight:"normal"}}>Pokemon GO, but in Google Maps</h1>
        <Button variant="contained" color="secondary">
          Get Started
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default Home;
