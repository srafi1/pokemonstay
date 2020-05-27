import React, { useState } from 'react';
import { Box, ThemeProvider, Typography } from '@material-ui/core';
import theme from '../common/theme';
import PokedexProgress from './PokedexProgress';

function Pokedex() {
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
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <Box pt={10}>
          <Typography variant="h3" color="error">
          Pokedex
          </Typography>
        </Box>

        <PokedexProgress totalEnc={totalEnc} totalCaught={totalCaught} total={pokedex.length} />

        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
          {
            pokedex.map((pokemon, i) => (
              <Box p={1} m={1} border="1px solid white" borderRadius={10}>
                <img src={
                  pokemon.caught ? `/api/sprite?dex=${i+1}` :
                    pokemon.encountered ? `/api/sprite?dex=${i+1}&silhouette` :
                    "/api/sprite?dex=0"
                  } width={200} alt={`${i+1}`} />
                <Typography variant="body1" align="center">
                  {`${i+1}`}
                </Typography>
              </Box>
            ))
          }
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Pokedex;
