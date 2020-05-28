import React, { useState } from 'react';
import { Box, ThemeProvider } from '@material-ui/core';
import theme from '../common/theme';
import Header from './Header';
import PokedexProgress from './PokedexProgress';

function Profile() {
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
        minHeight={1}
        bgcolor="background.default"
        color="text.primary"
        display="flex"
        flexDirection="column"
        alignItems="center">
        <Header page="Profile" />
        <PokedexProgress
          totalEnc={totalEnc}
          totalCaught={totalCaught}
          total={pokedex.length}/>
      </Box>
    </ThemeProvider>
  );
}

export default Profile;
