import React, { useState } from 'react';
import { Box, ThemeProvider, CircularProgress } from '@material-ui/core';
import theme from '../common/theme';
import Header from './Header';
import PokemonListing from './PokemonListing';

function Pokedex() {
  const [loaded, setLoaded] = useState(false);
  const [pokedex, setPokedex] = useState([{
    encountered: false,
    caught: false,
    name: "",
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

  const pokemonComponents = pokedex.map((pokemon, i) => (
    <PokemonListing
      key={i}
      dex={i+1}
      name={pokemon.name}
      showDex={true}
      hidden={!pokemon.encountered}
      silhouette={!pokemon.caught} />
  ));

  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight={1}
        bgcolor="background.default"
        color="text.primary"
        display="flex"
        flexDirection="column"
        alignItems="center">
        <Header page="Pokedex" />

        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
          {loaded ? pokemonComponents : <CircularProgress />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Pokedex;
