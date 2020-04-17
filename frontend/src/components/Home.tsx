import React, { useState } from 'react';
import { Box, Button, ThemeProvider } from '@material-ui/core';
import theme from '../common/theme';
import { Link, withRouter } from 'react-router-dom';
import logo from '../assets/logo.png';

function Home(props: any) {
  const [checkAuth, setCheckAuth] = useState(true);
  if (checkAuth) {
    fetch('/api/auth', {
      method: 'POST',
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      if (res.status === 200) {
        props.history.push('/map');
      }
    })
    setCheckAuth(false);
  }
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
        <h1 style={{fontWeight:"normal"}}>
          Pokemon GO, but in Google Maps
        </h1>
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

export default withRouter(Home);
