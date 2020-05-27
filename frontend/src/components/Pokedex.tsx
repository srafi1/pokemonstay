import React, { useState } from 'react';
import { Box, Button, ThemeProvider, Typography } from '@material-ui/core';
import theme from '../common/theme';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { commonStyles } from '../common/styles';
import LargeProgress from './LargeProgress';

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
        <Typography variant="h3" color="error">
          Pokedex
        </Typography>
        <Box p={2} display="flex" flexDirection="row">
          <Box pr={2} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6">
            Encountered:
            </Typography>
          <LargeProgress value={totalEnc} total={pokedex.length} />
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6">
            Caught:
            </Typography>
          <LargeProgress value={totalCaught} total={pokedex.length} />
          </Box>
        </Box>
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
