import React, { useState } from 'react';
import { Box, ThemeProvider, Typography } from '@material-ui/core';
import theme from '../common/theme';
import Header from './Header';

function capitalize(s: string):string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Pokemon() {
  const [loaded, setLoaded] = useState(false);
  const [pokemon, setPokemon] = useState([{
    lat: 0,
    lng: 0,
    dex: 0,
    name: "",
  }]);

  if (!loaded) {
    fetch('/api/pokemon', {
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      if (res.status !== 200) {
        console.log('Failed to retrieve pokemon');
      } else {
        res.json().then((json: any[]) => {
          setPokemon(json);
        });
      }
      setLoaded(true);
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight={1}
        bgcolor="background.default"
        color="text.primary"
        display="flex"
        flexDirection="column"
        alignItems="center">
        <Header page="Pokemon" />
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
          {
            pokemon.map((p, i) => (
              <Box key={i} p={1} m={1} border="1px solid white" borderRadius={10}>
                <img src={`/api/sprite?dex=${p.dex}`} width={200} alt={`${p.dex+1}`} />
                <Typography variant="body1" align="center">
                  {capitalize(`${p.name}`)}
                </Typography>
              </Box>
            ))
          }
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Pokemon;

