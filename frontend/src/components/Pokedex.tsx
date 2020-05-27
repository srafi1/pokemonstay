import React, { useState } from 'react';
import { Box, Button, ThemeProvider, Typography } from '@material-ui/core';
import theme from '../common/theme';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { commonStyles } from '../common/styles';

function Pokedex() {
  const styles = commonStyles();
  const [loaded, setLoaded] = useState(false);
  const [pokedex, setPokedex] = useState([{
    encountered: false,
    caught: false,
  }]);

  if (!loaded) {
    fetch('/api/pokedex', {
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      if (res.status !== 200) {
        console.log('Failed to retrieve pokedex');
      } else {
        res.json().then((json: any[]) => {
          setPokedex(json);
        });
      }
      setLoaded(true);
    });
  }

  const totalEnc = pokedex.filter(a => a.encountered).length
  const totalCaught = pokedex.filter(a => a.caught).length

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
        <img src={logo} className={styles.logo} alt="Pokemon Stay" />
        <Typography variant="h3">
          pokedex page
        </Typography>
        <Typography variant="body1">
          {totalEnc} / {pokedex.length} encountered
        </Typography>
        <Typography variant="body1">
          {totalCaught} / {pokedex.length} caught
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

export default Pokedex;
